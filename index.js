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
    const geminiApiKey = core.getInput('gemini-api-key') || process.env.GEMINI_API_KEY;
    const nvidiaApiKey = core.getInput('nvidia-api-key') || process.env.NVIDIA_API_KEY;

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

    // Initialize AI client
    let aiClient = null;
    if (geminiApiKey) {
      aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
      core.info('Initialized Google Gemini AI client.');
    } else if (nvidiaApiKey) {
      aiClient = new OpenAI({
        apiKey: nvidiaApiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
      });
      core.info('Initialized NVIDIA OpenAI-compatible client.');
    } else {
      core.warning('No GEMINI_API_KEY or NVIDIA_API_KEY provided. ARGUS will operate using fallback static analysis rules.');
    }

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
    const atlasResult = await generateTopologyMap(diffText, aiClient);

    core.info('Stage 2: Executing Athena (Architecture Report)...');
    const athenaResult = await evaluateArchitecture(diffText, architectureDocs, aiClient);

    core.info('Stage 3: Executing Hermes (Technical Debt Warnings)...');
    const hermesResult = await detectTechnicalDebt(fileContentsMap, aiClient);

    // 5. Build Markdown Review Comment
    let athenaSection = `**Status:** ${athenaResult.pass ? '✅ COMPLIANT' : '⚠️ VIOLATIONS DETECTED'}\n\n${athenaResult.summary}`;
    if (athenaResult.violations && athenaResult.violations.length > 0) {
      athenaSection += '\n\n**Violations:**\n' + athenaResult.violations.map(v => `- ❌ ${v}`).join('\n');
    }

    let hermesSection = '';
    if (hermesResult.debtFound && hermesResult.items.length > 0) {
      hermesSection = `⚠️ Flagged **${hermesResult.items.length}** item(s):\n\n| File | Line | Issue |\n| :--- | :--- | :--- |\n`;
      hermesResult.items.forEach(item => {
        hermesSection += `| \`${item.file}\` | ${item.line} | ${item.issue} |\n`;
      });
    } else {
      hermesSection = '✅ No TODOs, FIXMEs, or empty function placeholders detected in changed files.';
    }

    const commentMarker = '<!-- ARGUS-REVIEW-COMMENT -->';
    const commentBody = `${commentMarker}
# 👁️ ARGUS Code Review & Compliance Report

Thank you for your pull request! ARGUS has analyzed your changes through its 3-stage evaluation pipeline.

---

## 🗺️ Atlas Visual Impact Map
Below is a visual topology map of the structural changes in this PR:

${atlasResult}

---

## 🏛️ Athena Architecture Report
${athenaSection}

---

## ⚡ Hermes Technical Debt Warnings
${hermesSection}

---
*Generated automatically by ARGUS AI-powered GitHub Action for Track B.*
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
