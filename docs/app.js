// ==========================================================================
// ARGUS SHOWCASE — INTERACTIVE LOGIC (app.js)
// Features: Provider Tab Switcher, Custom Scrollbars & Live PR Playground
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Universal AI Provider Switcher ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const provName = document.getElementById('prov-name');
  const provSdk = document.getElementById('prov-sdk');
  const provModel = document.getElementById('prov-model');
  const provBaseurl = document.getElementById('prov-baseurl');
  const providerYamlCode = document.getElementById('provider-yaml-code');
  const copyProviderYamlBtn = document.getElementById('copy-provider-yaml');

  const providersData = {
    gemini: {
      name: "Google Gemini (Default)",
      sdk: "Native @google/genai",
      model: "gemini-2.0-flash",
      baseurlNeeded: "NO (Native)",
      yaml: `# Google Gemini (Default Workflow Setup)
- name: Run ARGUS AI Reviewer
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    gemini-api-key: \${{ secrets.GEMINI_API_KEY }}`
    },
    nvidia: {
      name: "NVIDIA NIM",
      sdk: "OpenAI Client Heuristic",
      model: "meta/llama-3.3-70b-instruct",
      baseurlNeeded: "YES",
      yaml: `# NVIDIA NIM Setup
- name: Run ARGUS AI Reviewer
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.NVIDIA_API_KEY }}
    base-url: "https://integrate.api.nvidia.com/v1"
    model: "meta/llama-3.3-70b-instruct"`
    },
    openrouter: {
      name: "OpenRouter",
      sdk: "OpenAI Client Heuristic",
      model: "google/gemini-2.0-flash-001",
      baseurlNeeded: "YES",
      yaml: `# OpenRouter Setup
- name: Run ARGUS AI Reviewer
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.OPENROUTER_API_KEY }}
    base-url: "https://openrouter.ai/api/v1"
    model: "google/gemini-2.0-flash-001"`
    },
    groq: {
      name: "Groq Cloud",
      sdk: "OpenAI Client Heuristic",
      model: "llama-3.3-70b-versatile",
      baseurlNeeded: "YES",
      yaml: `# Groq Cloud Setup
- name: Run ARGUS AI Reviewer
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.GROQ_API_KEY }}
    base-url: "https://api.groq.com/openai/v1"
    model: "llama-3.3-70b-versatile"`
    },
    openai: {
      name: "OpenAI Direct",
      sdk: "OpenAI Client Direct",
      model: "gpt-4o-mini",
      baseurlNeeded: "NO (Standard Endpoint)",
      yaml: `# OpenAI Direct Setup
- name: Run ARGUS AI Reviewer
  uses: SahooShuvranshu/Argus@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    api-key: \${{ secrets.OPENAI_API_KEY }}
    model: "gpt-4o-mini"`
    }
  };

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

  // --- 2. Live PR Diff Sandbox Playground ---
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
+}`,
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
@@ -1,5 +1,7 @@
+// Directly importing database layer from UI representation (Layering Violation)
+const db = require('../database/connection');
 function generateTopologyMap(diff) {
   return 'flowchart TD';
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
      runArgusBtn.disabled = true;
      runArgusBtn.textContent = '⏳ EVALUATING PR...';

      argusOutput.innerHTML = `
        <p class="log-line"><span class="log-info">[STAGE 1]</span> 🎨 Executing Atlas visual topology parser...</p>
        <p class="log-line"><span class="log-info">[STAGE 2]</span> 🏛️ Executing Athena architecture compliance guard...</p>
        <p class="log-line"><span class="log-info">[STAGE 3]</span> ⚡ Executing Hermes technical debt scanner...</p>
      `;

      setTimeout(() => {
        runArgusBtn.disabled = false;
        runArgusBtn.textContent = '▶ RUN ARGUS EVALUATION';
        let outputHtml = '';

        if (currentVal === 'clean') {
          outputHtml = `
            <div style="color: var(--athena-green); font-weight: bold; margin-bottom: 12px;">
              # 👁️ ARGUS Executive PR Review Scorecard
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid rgba(124, 58, 237, 0.3);">
              <tr style="background: #111827; border-bottom: 1px solid rgba(124, 58, 237, 0.3); color: #94A3B8;">
                <th style="padding: 8px; text-align: left;">Stage</th>
                <th style="padding: 8px; text-align: center;">Status</th>
                <th style="padding: 8px; text-align: left;">Summary</th>
              </tr>
              <tr style="border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
                <td style="padding: 8px;">🎨 <b>Atlas (Visualizer)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ RENDERED</td>
                <td style="padding: 8px;">Topology flowchart generated</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
                <td style="padding: 8px;">🏛️ <b>Athena (Compliance)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ COMPLIANT</td>
                <td style="padding: 8px;">0 violations against architecture.md</td>
              </tr>
              <tr>
                <td style="padding: 8px;">⚡ <b>Hermes (Debt Scanner)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ CLEAN</td>
                <td style="padding: 8px;">0 items flagged</td>
              </tr>
            </table>
            <div style="background: #111827; padding: 12px; border: 1px solid rgba(124, 58, 237, 0.3); font-family: var(--font-mono);">
              <span style="color: var(--atlas-cyan);">Atlas Topology Flowchart:</span><br>
              <code>flowchart TD<br>&nbsp;&nbsp;PR[PR Diff] --&gt; Mod[src/authService.js]</code>
            </div>
          `;
        } else if (currentVal === 'todo') {
          outputHtml = `
            <div style="color: var(--hermes-gold); font-weight: bold; margin-bottom: 12px;">
              # 👁️ ARGUS Executive PR Review Scorecard
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid rgba(124, 58, 237, 0.3);">
              <tr style="background: #111827; border-bottom: 1px solid rgba(124, 58, 237, 0.3); color: #94A3B8;">
                <th style="padding: 8px; text-align: left;">Stage</th>
                <th style="padding: 8px; text-align: center;">Status</th>
                <th style="padding: 8px; text-align: left;">Summary</th>
              </tr>
              <tr style="border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
                <td style="padding: 8px;">🎨 <b>Atlas (Visualizer)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ RENDERED</td>
                <td style="padding: 8px;">Topology flowchart generated</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
                <td style="padding: 8px;">🏛️ <b>Athena (Compliance)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ COMPLIANT</td>
                <td style="padding: 8px;">0 violations</td>
              </tr>
              <tr>
                <td style="padding: 8px;">⚡ <b>Hermes (Debt Scanner)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--hermes-gold);">⚠️ ISSUES FLAGGED</td>
                <td style="padding: 8px;">2 items flagged</td>
              </tr>
            </table>
            <div style="background: #111827; padding: 12px; border: 1px solid rgba(124, 58, 237, 0.3); color: #E2E8F0; line-height: 1.8;">
              <span style="color: var(--hermes-red); font-weight: bold;">🔴 BLOCK</span> | <code>src/demoService.js:L11</code> | Hardcoded Secret Key Pattern Detected<br>
              <span style="color: var(--hermes-gold); font-weight: bold;">🟡 WARN</span> | <code>src/demoService.js:L10</code> | Unfinished TODO comment stub
            </div>
          `;
        } else {
          outputHtml = `
            <div style="color: var(--hermes-gold); font-weight: bold; margin-bottom: 12px;">
              # 👁️ ARGUS Executive PR Review Scorecard
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid rgba(124, 58, 237, 0.3);">
              <tr style="background: #111827; border-bottom: 1px solid rgba(124, 58, 237, 0.3); color: #94A3B8;">
                <th style="padding: 8px; text-align: left;">Stage</th>
                <th style="padding: 8px; text-align: center;">Status</th>
                <th style="padding: 8px; text-align: left;">Summary</th>
              </tr>
              <tr style="border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
                <td style="padding: 8px;">🎨 <b>Atlas (Visualizer)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ RENDERED</td>
                <td style="padding: 8px;">Topology flowchart generated</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(124, 58, 237, 0.2);">
                <td style="padding: 8px;">🏛️ <b>Athena (Compliance)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--hermes-gold);">⚠️ WARN</td>
                <td style="padding: 8px;">Potential layering boundary mismatch</td>
              </tr>
              <tr>
                <td style="padding: 8px;">⚡ <b>Hermes (Debt Scanner)</b></td>
                <td style="padding: 8px; text-align: center; color: var(--athena-green);">✅ CLEAN</td>
                <td style="padding: 8px;">0 items flagged</td>
              </tr>
            </table>
            <div style="background: #111827; padding: 12px; border: 1px solid rgba(124, 58, 237, 0.3); color: #E2E8F0;">
              <span style="color: var(--hermes-gold); font-weight: bold;">🟡 WARN</span> | <code>skills/atlas.js:L2</code> | Direct import cross-layering violation against architecture.md
            </div>
          `;
        }

        argusOutput.innerHTML = outputHtml;
      }, 600);
    });
  }

  // --- 3. Quick Copy Buttons ---
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
