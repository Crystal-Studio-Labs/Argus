/* ==========================================================================
   ARGUS SHOWCASE — INTERACTIVE JAVASCRIPT APP (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Provider Tab Switcher Data ---
  const providersData = {
    gemini: {
      name: 'Google Gemini (Default)',
      sdk: 'Native @google/genai SDK',
      model: 'gemini-2.0-flash',
      baseurlNeeded: 'NO (Native SDK)',
      yaml: `# Google Gemini (Default Workflow Setup)
- name: Run ARGUS AI Reviewer
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    gemini-api-key: \${{ secrets.GEMINI_API_KEY }}`
    },
    nvidia: {
      name: 'NVIDIA NIM API',
      sdk: 'Universal OpenAI SDK',
      model: 'meta/llama-3.3-70b-instruct',
      baseurlNeeded: 'YES (https://integrate.api.nvidia.com/v1)',
      yaml: `# NVIDIA NIM API Setup
- name: Run ARGUS AI Reviewer (NVIDIA NIM)
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.NVIDIA_API_KEY }}
    base-url: "https://integrate.api.nvidia.com/v1"
    model: "meta/llama-3.3-70b-instruct"`
    },
    openrouter: {
      name: 'OpenRouter AI',
      sdk: 'Universal OpenAI SDK',
      model: 'google/gemini-2.0-flash-001',
      baseurlNeeded: 'YES (https://openrouter.ai/api/v1)',
      yaml: `# OpenRouter Setup
- name: Run ARGUS AI Reviewer (OpenRouter)
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.OPENROUTER_API_KEY }}
    base-url: "https://openrouter.ai/api/v1"
    model: "google/gemini-2.0-flash-001"`
    },
    groq: {
      name: 'Groq Cloud AI',
      sdk: 'Universal OpenAI SDK',
      model: 'llama-3.3-70b-versatile',
      baseurlNeeded: 'YES (https://api.groq.com/openai/v1)',
      yaml: `# Groq Cloud Setup
- name: Run ARGUS AI Reviewer (Groq)
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.GROQ_API_KEY }}
    base-url: "https://api.groq.com/openai/v1"
    model: "llama-3.3-70b-versatile"`
    },
    openai: {
      name: 'OpenAI Direct API',
      sdk: 'Universal OpenAI SDK',
      model: 'gpt-4o-mini',
      baseurlNeeded: 'YES (https://api.openai.com/v1)',
      yaml: `# OpenAI Setup
- name: Run ARGUS AI Reviewer (OpenAI)
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.OPENAI_API_KEY }}
    model: "gpt-4o-mini"`
    }
  };

  const tabBtns = document.querySelectorAll('.provider-tabs .tab-btn');
  const provName = document.getElementById('prov-name');
  const provSdk = document.getElementById('prov-sdk');
  const provModel = document.getElementById('prov-model');
  const provBaseurl = document.getElementById('prov-baseurl');
  const providerYamlCode = document.getElementById('provider-yaml-code');
  const copyProviderYamlBtn = document.getElementById('copy-provider-yaml');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const pKey = btn.dataset.provider;
      const data = providersData[pKey];

      if (data) {
        provName.textContent = data.name;
        provSdk.textContent = data.sdk;
        provModel.textContent = data.model;
        provBaseurl.textContent = data.baseurlNeeded;
        providerYamlCode.textContent = data.yaml;
      }
    });
  });

  if (copyProviderYamlBtn) {
    copyProviderYamlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(providerYamlCode.textContent);
      copyProviderYamlBtn.textContent = 'COPIED!';
      setTimeout(() => copyProviderYamlBtn.textContent = 'COPY YAML', 2000);
    });
  }

  // --- 2. Live PR Diff Playground Simulator ---
  const sampleDiffs = {
    clean: `diff --git a/src/authService.js b/src/authService.js
index 813ec13..9b4795d 100644
--- a/src/authService.js
+++ b/src/authService.js
@@ -1,5 +1,9 @@
-function login(user) {
-  return false;
+function login(user, pass) {
+  if (!user || !pass) {
+    throw new Error('Credentials required');
+  }
+  return authenticateToken(user, pass);
 }`,
    todo: `diff --git a/src/demoService.js b/src/demoService.js
index 9b4795d..bf71fd5 100644
--- a/src/demoService.js
+++ b/src/demoService.js
@@ -10,6 +10,8 @@ function processPayment(amount) {
+  // TODO: Implement actual Payment gateway connection later
+  const apiKey = "DUMMY_MOCK_SECRET_KEY_12345";
   console.log("Processing amount:", amount);
   return true;
 }`,
    arch: `diff --git a/skills/atlas.js b/skills/atlas.js
index 42d7d2f..f88feb3 100644
--- a/skills/atlas.js
+++ b/skills/atlas.js
@@ -5,6 +5,7 @@
+const rawDbConnection = require('sqlite3'); // Direct DB coupling in skill visualizer stage
 function generateTopologyMap(diffText) {
+  rawDbConnection.connect('/var/db');
   return "flowchart TD";
 }`
  };

  const sampleSelect = document.getElementById('sample-select');
  const diffInput = document.getElementById('diff-input');
  const runArgusBtn = document.getElementById('run-argus-btn');
  const argusOutput = document.getElementById('argus-output');

  if (sampleSelect && diffInput) {
    diffInput.value = sampleDiffs.clean;

    sampleSelect.addEventListener('change', () => {
      diffInput.value = sampleDiffs[sampleSelect.value] || '';
    });
  }

  if (runArgusBtn) {
    runArgusBtn.addEventListener('click', () => {
      const currentVal = sampleSelect ? sampleSelect.value : 'clean';
      argusOutput.innerHTML = `<p class="log-line"><span class="log-info">[STAGE 1]</span> Running Atlas visualizer...</p>`;

      setTimeout(() => {
        let outputHtml = '';

        if (currentVal === 'clean') {
          outputHtml = `
            <div style="color: var(--render-accent); font-weight: bold; margin-bottom: 12px;">
              # 👁️ ARGUS Code Review & Executive Scorecard
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #2C2C2E;">
              <tr style="background: #161617; border-bottom: 1px solid #2C2C2E; color: #94A3B8;">
                <th style="padding: 6px; text-align: left;">Stage</th>
                <th style="padding: 6px; text-align: center;">Status</th>
                <th style="padding: 6px; text-align: left;">Summary</th>
              </tr>
              <tr style="border-bottom: 1px solid #2C2C2E;">
                <td style="padding: 6px;">🎨 <b>Atlas (Visualizer)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ RENDERED</td>
                <td style="padding: 6px;">Topology flowchart generated</td>
              </tr>
              <tr style="border-bottom: 1px solid #2C2C2E;">
                <td style="padding: 6px;">🏛️ <b>Athena (Compliance)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ COMPLIANT</td>
                <td style="padding: 6px;">0 violations</td>
              </tr>
              <tr>
                <td style="padding: 6px;">⚡ <b>Hermes (Debt Scanner)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ CLEAN</td>
                <td style="padding: 6px;">0 issues flagged</td>
              </tr>
            </table>
            <div style="background: #161617; padding: 10px; border: 1px solid #2C2C2E; font-family: var(--font-mono);">
              <span style="color: var(--cyber-blue);">Atlas Topology Flowchart:</span><br>
              <code>flowchart TD<br>&nbsp;&nbsp;PR[PR Diff] --&gt; Mod[src/authService.js]</code>
            </div>
          `;
        } else if (currentVal === 'todo') {
          outputHtml = `
            <div style="color: var(--hermes-amber); font-weight: bold; margin-bottom: 12px;">
              # 👁️ ARGUS Code Review & Executive Scorecard
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #2C2C2E;">
              <tr style="background: #161617; border-bottom: 1px solid #2C2C2E; color: #94A3B8;">
                <th style="padding: 6px; text-align: left;">Stage</th>
                <th style="padding: 6px; text-align: center;">Status</th>
                <th style="padding: 6px; text-align: left;">Summary</th>
              </tr>
              <tr style="border-bottom: 1px solid #2C2C2E;">
                <td style="padding: 6px;">🎨 <b>Atlas (Visualizer)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ RENDERED</td>
                <td style="padding: 6px;">Topology flowchart generated</td>
              </tr>
              <tr style="border-bottom: 1px solid #2C2C2E;">
                <td style="padding: 6px;">🏛️ <b>Athena (Compliance)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ COMPLIANT</td>
                <td style="padding: 6px;">0 violations</td>
              </tr>
              <tr>
                <td style="padding: 6px;">⚡ <b>Hermes (Debt Scanner)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--hermes-amber);">⚠️ ISSUES FLAGGED</td>
                <td style="padding: 6px;">2 items flagged</td>
              </tr>
            </table>
            <div style="background: #161617; padding: 10px; border: 1px solid #2C2C2E; color: #E2E8F0;">
              <span style="color: var(--hermes-red);">🔴 BLOCK</span> | <code>src/demoService.js:L11</code> | Hardcoded Secret API Key Leak<br>
              <span style="color: var(--hermes-amber);">🟡 WARN</span> | <code>src/demoService.js:L10</code> | Unfinished TODO comment stub
            </div>
          `;
        } else {
          outputHtml = `
            <div style="color: var(--hermes-amber); font-weight: bold; margin-bottom: 12px;">
              # 👁️ ARGUS Code Review & Executive Scorecard
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #2C2C2E;">
              <tr style="background: #161617; border-bottom: 1px solid #2C2C2E; color: #94A3B8;">
                <th style="padding: 6px; text-align: left;">Stage</th>
                <th style="padding: 6px; text-align: center;">Status</th>
                <th style="padding: 6px; text-align: left;">Summary</th>
              </tr>
              <tr style="border-bottom: 1px solid #2C2C2E;">
                <td style="padding: 6px;">🎨 <b>Atlas (Visualizer)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ RENDERED</td>
                <td style="padding: 6px;">Topology flowchart generated</td>
              </tr>
              <tr style="border-bottom: 1px solid #2C2C2E;">
                <td style="padding: 6px;">🏛️ <b>Athena (Compliance)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--hermes-amber);">⚠️ VIOLATIONS</td>
                <td style="padding: 6px;">1 violation notice</td>
              </tr>
              <tr>
                <td style="padding: 6px;">⚡ <b>Hermes (Debt Scanner)</b></td>
                <td style="padding: 6px; text-align: center; color: var(--render-accent);">✅ CLEAN</td>
                <td style="padding: 6px;">0 issues flagged</td>
              </tr>
            </table>
            <div style="background: #161617; padding: 10px; border: 1px solid #2C2C2E; color: #E2E8F0;">
              <span style="color: var(--hermes-amber);">❌ VIOLATION:</span> Direct sqlite3 DB import in skills/atlas.js violates modularity rules in architecture.md.
            </div>
          `;
        }

        argusOutput.innerHTML = outputHtml;
      }, 500);
    });
  }

  // --- 3. Quickstart Copy Generator ---
  const copyQsBtn = document.getElementById('copy-qs-btn');
  const qsCode = document.getElementById('qs-code');

  if (copyQsBtn && qsCode) {
    copyQsBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(qsCode.textContent);
      copyQsBtn.textContent = 'COPIED!';
      setTimeout(() => copyQsBtn.textContent = 'COPY WORKFLOW', 2000);
    });
  }

});
