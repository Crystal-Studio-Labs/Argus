const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenAI } = require('@google/genai');

const generateMermaidDiagram = require('./skills/atlas');
const checkCompliance = require('./skills/athena');
const scanFiles = require('./skills/hermes');

async function run() {
  try {
    // 1. Get Inputs
    const token = core.getInput('github-token', { required: true });
    const geminiApiKey = core.getInput('gemini-api-key', { required: true });

    // 2. Validate Event
    const context = github.context;
    if (context.eventName !== 'pull_request') {
      core.setFailed('ARGUS Action can only run on pull_request events.');
      return;
    }

    const pullRequest = context.payload.pull_request;
    const pullNumber = pullRequest.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    core.info(`Starting ARGUS review for PR #${pullNumber} in ${owner}/${repo}`);

    // 3. Initialize Clients
    const octokit = github.getOctokit(token);
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // 4. Fetch Git Diff from GitHub API
    core.info('Fetching PR git diff...');
    let diffString = '';
    try {
      const { data: diffData } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        headers: {
          accept: 'application/vnd.github.v3.diff',
        },
      });
      diffString = diffData;
    } catch (diffError) {
      core.warning(`Failed to fetch diff from API: ${diffError.message}. Using fallback empty diff.`);
    }

    // 5. Get Changed Files list and contents
    core.info('Fetching changed files list...');
    const changedFiles = [];
    try {
      const { data: files } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

      for (const file of files) {
        // Only scan existing files that are modified or added
        if (file.status === 'modified' || file.status === 'added') {
          const localPath = path.join(process.env.GITHUB_WORKSPACE || '.', file.filename);
          if (fs.existsSync(localPath)) {
            const content = fs.readFileSync(localPath, 'utf-8');
            changedFiles.push({
              path: file.filename,
              content,
            });
          }
        }
      }
    } catch (filesError) {
      core.warning(`Error listing or reading changed files: ${filesError.message}`);
    }

    // 6. Read architecture.md for Athena Compliance Guard
    let architectureDocs = '';
    const archPath = path.join(process.env.GITHUB_WORKSPACE || '.', 'architecture.md');
    if (fs.existsSync(archPath)) {
      architectureDocs = fs.readFileSync(archPath, 'utf-8');
    } else {
      core.warning('architecture.md not found in workspace. Athena will run without architecture context.');
    }

    // 7. Execute 3-Stage Evaluation Pipeline Sequentially
    core.info('Executing Stage 1: Atlas (Visualizer)...');
    let atlasOutput = '';
    try {
      atlasOutput = await generateMermaidDiagram(diffString, ai);
    } catch (e) {
      core.error(`Atlas execution failed: ${e.message}`);
      atlasOutput = `*Atlas execution failed: ${e.message}*`;
    }

    core.info('Executing Stage 2: Athena (Compliance Guard)...');
    let athenaOutput = '';
    try {
      athenaOutput = await checkCompliance(diffString, architectureDocs, ai);
    } catch (e) {
      core.error(`Athena execution failed: ${e.message}`);
      athenaOutput = `*Athena execution failed: ${e.message}*`;
    }

    core.info('Executing Stage 3: Hermes (Unfinished Code Scanner)...');
    let hermesOutput = '';
    try {
      hermesOutput = await scanFiles(changedFiles, ai);
    } catch (e) {
      core.error(`Hermes execution failed: ${e.message}`);
      hermesOutput = `*Hermes execution failed: ${e.message}*`;
    }

    // 8. Assemble single Markdown review comment
    const commentBody = `
# 👁️ ARGUS Code Review & Compliance Report

Thank you for your pull request! ARGUS has completed its sequential 3-stage evaluation pipeline.

---

## 🎨 Stage 1: Atlas Visual Flow
Below is a visual diagram of the changed paths/logic in this PR:

${atlasOutput}

---

## 🏛️ Stage 2: Athena Compliance Guard
Here is the architectural verification against \`architecture.md\`:

${athenaOutput}

---

## ✉️ Stage 3: Hermes Code Scanner
Here is the scan report for TODOs, FIXMEs, and empty placeholder functions:

${hermesOutput}

---
*Report generated automatically by ARGUS AI-powered GitHub Action for Track B.*
`;

    // 9. Post comment to Pull Request
    core.info('Posting combined review comment to PR...');
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: commentBody.trim(),
    });

    core.info('ARGUS review comment posted successfully.');

  } catch (error) {
    core.setFailed(`ARGUS Action execution failed: ${error.message}`);
  }
}

// Only execute run if this is the main entry point (avoid running on import during tests)
if (require.main === module) {
  run();
}

module.exports = { run };
