const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

const generateTopologyMap = require('./skills/atlas');
const evaluateArchitecture = require('./skills/athena');
const detectTechnicalDebt = require('./skills/hermes');

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });

    // Inputs & Env Fallbacks for Universal AI Client Setup
    const apiKey = core.getInput('api-key')
      || core.getInput('openai-api-key')
      || core.getInput('gemini-api-key')
      || core.getInput('nvidia-api-key')
      || process.env.OPENAI_API_KEY
      || process.env.AI_API_KEY
      || process.env.NVIDIA_API_KEY
      || process.env.OPENROUTER_API_KEY
      || process.env.GEMINI_API_KEY;

    let baseURL = core.getInput('base-url') || process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL;
    let modelName = core.getInput('model') || process.env.OPENAI_MODEL || process.env.AI_MODEL;

    // Smart provider detection defaults
    if (apiKey && apiKey.startsWith('nvapi-') && (!baseURL || baseURL.includes('openai.com'))) {
      baseURL = 'https://integrate.api.nvidia.com/v1';
      if (!modelName || modelName === 'gpt-4o-mini') {
        modelName = 'meta/llama-3.3-70b-instruct';
      }
    }

    if (apiKey && apiKey.startsWith('sk-or-') && (!baseURL || baseURL.includes('openai.com'))) {
      baseURL = 'https://openrouter.ai/api/v1';
      if (!modelName || modelName === 'gpt-4o-mini') {
        modelName = 'google/gemini-2.0-flash-001';
      }
    }

    let aiClient = null;
    if (apiKey) {
      if (apiKey.startsWith('AQ.') || apiKey.startsWith('AIza')) {
        aiClient = new GoogleGenAI({ apiKey });
        aiClient.defaultModel = modelName || 'gemini-2.0-flash';
        core.info(`Initialized Google Gemini SDK client (Model: ${aiClient.defaultModel})`);
      } else {
        const finalBaseURL = baseURL || 'https://api.openai.com/v1';
        aiClient = new OpenAI({
          apiKey,
          baseURL: finalBaseURL,
        });
        aiClient.defaultModel = modelName || 'gpt-4o-mini';
        core.info(`Initialized Universal OpenAI-compatible AI client (BaseURL: ${finalBaseURL}, Model: ${aiClient.defaultModel})`);
      }
    } else {
      core.warning('No AI API key provided. ARGUS will operate using fallback static analysis rules.');
    }

    const context = github.context;
    if (context.eventName !== 'pull_request') {
      core.setFailed('ARGUS Action can only run on pull_request events.');
      return;
    }

    const pullRequest = context.payload.pull_request;
    const pullNumber = pullRequest.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    core.info(`Starting ARGUS code review for PR #${pullNumber} in ${owner}/${repo}`);

    const octokit = github.getOctokit(token);

    // 1. Fetch Git Diff
    core.info('Fetching PR git diff...');
    let diffText = '';
    try {
      const { data: diffData } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        headers: { accept: 'application/vnd.github.v3.diff' },
      });
      diffText = typeof diffData === 'string' ? diffData : '';
    } catch (e) {
      core.warning(`Could not fetch git diff: ${e.message}`);
    }

    // 2. Fetch Changed Files Content
    core.info('Fetching changed files list...');
    const fileContentsMap = [];
    try {
      const { data: files } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

      for (const file of files) {
        if (file.status === 'modified' || file.status === 'added') {
          const localPath = path.join(process.env.GITHUB_WORKSPACE || '.', file.filename);
          if (fs.existsSync(localPath)) {
            const content = fs.readFileSync(localPath, 'utf-8');
            fileContentsMap.push({ path: file.filename, content });
          }
        }
      }
    } catch (e) {
      core.warning(`Could not read changed files: ${e.message}`);
    }

    // 3. Read architecture.md
    let architectureDocs = '';
    const archPath = path.join(process.env.GITHUB_WORKSPACE || '.', 'architecture.md');
    if (fs.existsSync(archPath)) {
      architectureDocs = fs.readFileSync(archPath, 'utf-8');
    }

    // 4. Run Skills Sequentially
    core.info('Stage 1: Executing Atlas (Visual Impact Map)...');
    const atlasResult = await generateTopologyMap(diffText, aiClient, modelName);

    core.info('Stage 2: Executing Athena (Architecture Report)...');
    const athenaResult = await evaluateArchitecture(diffText, architectureDocs, aiClient, modelName);

    core.info('Stage 3: Executing Hermes (Technical Debt Warnings)...');
    const hermesResult = await detectTechnicalDebt(fileContentsMap, aiClient, modelName);

    // 5. Build Polished Markdown Review Comment
    const athenaStatus = athenaResult.pass ? '✅ COMPLIANT' : '⚠️ VIOLATIONS DETECTED';
    let athenaSection = `**Status:** ${athenaStatus}\n\n${athenaResult.summary}`;
    if (athenaResult.violations && athenaResult.violations.length > 0) {
      athenaSection += '\n\n**Violations:**\n' + athenaResult.violations.map(v => `- ❌ ${v}`).join('\n');
    }

    const hermesStatus = hermesResult.debtFound ? '⚠️ ISSUES FLAGGED' : '✅ CLEAN';
    let hermesSection = '';
    if (hermesResult.debtFound && hermesResult.items.length > 0) {
      hermesSection = `⚠️ Flagged **${hermesResult.items.length}** item(s):\n\n| Severity | File | Line | Issue |\n| :---: | :--- | :---: | :--- |\n`;
      hermesResult.items.forEach(item => {
        const badge = item.severity === 'BLOCK' ? '🔴 BLOCK' : item.severity === 'INFO' ? '🔵 INFO' : '🟡 WARN';
        hermesSection += `| ${badge} | \`${item.file}\` | ${item.line} | ${item.issue} |\n`;
      });
    } else {
      hermesSection = '✅ No TODOs, FIXMEs, hardcoded secrets, or empty function placeholders detected.';
    }

    const commentMarker = '<!-- ARGUS-REVIEW-COMMENT -->';
    const commentBody = `${commentMarker}
# 👁️ ARGUS Code Review & Executive Scorecard

Thank you for your pull request! ARGUS has completed its 3-stage automated evaluation pipeline.

### 📊 Executive Summary
| Evaluation Stage | Status | Summary |
| :--- | :---: | :--- |
| 🎨 **Stage 1: Atlas (Visualizer)** | ✅ RENDERED | Topology flowchart generated |
| 🏛️ **Stage 2: Athena (Compliance)** | ${athenaStatus} | ${athenaResult.violations.length} notice(s) |
| ⚡ **Stage 3: Hermes (Debt Scanner)** | ${hermesStatus} | ${hermesResult.items.length} item(s) flagged |

---

## 🎨 Stage 1: Atlas Visual Impact Map
<details open>
<summary><b>🔍 View Interactive Topology Flowchart</b></summary>

${atlasResult}

</details>

---

## 🏛️ Stage 2: Athena Architecture Guard
${athenaSection}

---

## ⚡ Stage 3: Hermes Technical Debt & Code Scanner
${hermesSection}

---
*Report generated automatically by [ARGUS AI PR Reviewer](https://github.com/SahooShuvranshu/Argus).*
`;

    // 6. Post or Update PR Comment
    core.info('Posting/updating review comment on PR...');
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pullNumber,
    });

    const existingComment = comments.find(c => c.body && c.body.includes(commentMarker));

    if (existingComment) {
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body: commentBody.trim(),
      });
      core.info(`Updated existing ARGUS review comment (ID: ${existingComment.id}).`);
    } else {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: commentBody.trim(),
      });
      core.info('Created new ARGUS review comment.');
    }

  } catch (error) {
    core.setFailed(`ARGUS Action execution failed: ${error.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
