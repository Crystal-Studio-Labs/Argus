<div align="center">
  <h1>👁️ ARGUS</h1>
  <p><b>Autonomous 3-Stage AI Code Reviewer & Architecture Guardian for GitHub Actions</b></p>

  [![CI Pipeline](https://img.shields.io/badge/CI_PIPELINE-PASSED-10B981?style=for-the-badge&logo=github-actions)](https://github.com/Crystal-Studio-Labs/Argus/actions/workflows/ci.yml)
  [![Marketplace](https://img.shields.io/badge/MARKETPLACE-ARGUS_AI_CODE_REVIEWER-7C3AED?style=for-the-badge&logo=github)](https://github.com/marketplace/actions/argus-ai-code-reviewer)
  [![Node.js](https://img.shields.io/badge/NODE.JS-%3E%3D20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![License: MIT](https://img.shields.io/badge/LICENSE-MIT-F59E0B?style=for-the-badge)](LICENSE)

  <br>

  <p>
    <a href="https://sahooshuvranshu.github.io/Argus/"><b>🌐 Live Showcase Site</b></a> •
    <a href="https://github.com/marketplace/actions/argus-ai-code-reviewer"><b>📦 GitHub Marketplace</b></a> •
    <a href="#-quick-start-workflow-setup"><b>🚀 Quick Start</b></a> •
    <a href="https://sahooshuvranshu.is-a.dev"><b>👨‍💻 Developer Website</b></a>
  </p>
</div>

---

## 📋 Table of Contents

- [Overview & Core Features](#-overview--core-features)
- [3-Stage Evaluation Pipeline](#-3-stage-evaluation-pipeline)
- [SpecKit Specification-Driven Architecture](#-speckit-specification-driven-architecture)
- [Universal AI Cloud Providers](#-universal-ai-cloud-providers)
- [Quick Start Workflow Setup](#-quick-start-workflow-setup)
- [Action Inputs & Parameters](#-action-inputs--parameters)
- [AI Rate Limits & Plan Guidance](#-ai-rate-limits--plan-guidance)
- [Mythological Origins & Codebase Mapping](#-mythological-origins--codebase-mapping)
- [Origins & History](#-origins--history)
- [Contact & Support](#-contact--support)

---

## 🚀 Overview & Core Features

**ARGUS** is a production-grade, multi-provider AI code reviewer for GitHub Actions. Whenever a developer opens or updates a Pull Request, ARGUS executes an autonomous 3-stage review pipeline in seconds:

1. **🎨 Stage 1: Atlas (Visualizer)** — Generates an interactive Mermaid.js flowchart (`flowchart TD`) mapping changed control flows.
2. **🏛️ Stage 2: Athena (Architect)** — Cross-references code changes against rules in `architecture.md` to prevent architectural decay.
3. **⚡ Stage 3: Hermes (Debt Scanner)** — Scans modified files line-by-line for hardcoded API keys (`🔴 BLOCK`), `// TODO` comments & empty stubs (`🟡 WARN`), and debug statements (`🔵 INFO`).

### Key Production Engineering Features

- **Zero CI Break Guarantee**: Includes an offline static regex engine that completes PR reviews safely if cloud APIs hit rate limits or network blips.
- **Smart Key Auto-Detection**: Automatically detects key signatures (`gsk_` ➔ Groq, `nvapi-` ➔ NVIDIA, `sk-or-` ➔ OpenRouter, `AIza` ➔ Gemini) with zero manual URL configuration.
- **Lockfile Noise Filtering**: Excludes `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `.min.js`, `.map`, and build output directories from AI review prompts.
- **Large Diff Truncation**: Intelligently truncates diffs at 80,000 characters to prevent API context window overflow.
- **Single-Thread Idempotent Comments**: Maintains a single executive scorecard comment per Pull Request thread to eliminate notification noise.

---

## 🎨 3-Stage Evaluation Pipeline

| Stage | Persona | Primary Task | Output Artifact | Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 1** | **Atlas** (Visualizer) | Generates visual topology flowcharts | `flowchart TD` Mermaid Diagram | [`skills/atlas.js`](skills/atlas.js) |
| **Stage 2** | **Athena** (Architect) | Evaluates compliance against `architecture.md` | Architectural Compliance Matrix | [`skills/athena.js`](skills/athena.js) |
| **Stage 3** | **Hermes** (Debt Scanner) | Scans line-by-line for TODOs, stubs & secrets | Flagged Items Table (`🔴 BLOCK`, `🟡 WARN`, `🔵 INFO`) | [`skills/hermes.js`](skills/hermes.js) |

---

## 🛠️ SpecKit Specification-Driven Architecture

ARGUS was designed and built using **SpecKit** (Specification Driven Development). The project structure enforces formal design artifacts and agent governance:

- 🏛️ [**Agent Constitution**](AGENTS.md): Core operating principles, input boundaries, and rule matrix (`ARGUS-01` zero placeholders, `ARGUS-02` spec compliance, `ARGUS-03` structural flowcharts).
- 📐 [**Architecture Specification**](architecture.md): Formal tech stack declaration, component layering, and module boundary rules.
- ⚙️ [**SpecKit Memory & Governance**](.specify/memory/constitution.md): Governance rules for automated code reviews.

---

## 🌐 Universal AI Cloud Providers

ARGUS is powered by **Google Gemini** natively by default, with universal support for any OpenAI-compatible AI cloud provider:

| Key Prefix | Target AI Provider | Default REST Base URL | Default AI Model |
| :--- | :--- | :--- | :--- |
| `AIza...` / `AQ...` | **Google Gemini** (Default) | Native `@google/genai` | `gemini-2.0-flash` |
| `gsk_...` | **Groq Cloud** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| `nvapi-...` | **NVIDIA NIM** | `https://integrate.api.nvidia.com/v1` | `meta/llama-3.3-70b-instruct` |
| `sk-or-...` | **OpenRouter** | `https://openrouter.ai/api/v1` | `google/gemini-2.0-flash-001` |
| `sk-...` | **OpenAI Direct** | `https://api.openai.com/v1` | `gpt-4o-mini` |

> 💡 **Hybrid Priority Rule**: Explicit workflow inputs (`model`, `base-url`) **ALWAYS** override defaults. If omitted, ARGUS auto-routes based on key prefix.

---

## 🚀 Quick Start Workflow Setup

Add the following workflow file to your repository under `.github/workflows/argus.yml`:

```yaml
name: ARGUS AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  argus-review:
    name: ARGUS 3-Stage AI PR Review
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ARGUS AI Reviewer
        uses: Crystal-Studio-Labs/Argus@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

### Groq / NVIDIA / OpenRouter Workflow Example

```yaml
      - name: Run ARGUS AI Reviewer (Groq / NVIDIA / OpenRouter)
        uses: Crystal-Studio-Labs/Argus@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.GROQ_API_KEY }} # Auto-routes to Groq Cloud (llama-3.3-70b-versatile)
```

---

## ⚙️ Action Inputs & Parameters

| Input Key | Description | Required | Default Value |
| :--- | :--- | :---: | :--- |
| `github-token` | GitHub token for fetching diffs and posting PR comments | False | `${{ github.token }}` |
| `gemini-api-key` | Google Gemini API key (primary default engine) | False | *None* |
| `groq-api-key` | Groq Cloud API key (sub-second 70B inference) | False | *None* |
| `api-key` | Universal API key for Gemini or OpenAI-compatible providers | False | *None* |
| `base-url` | Custom REST endpoint URL for OpenAI-compatible providers | False | *Auto-detected* |
| `model` | AI model identifier string | False | `gemini-2.0-flash` |

---

## 💡 AI Rate Limits & Plan Guidance

- **Free Tier API Keys**: Free tier keys (such as Google Gemini Free Tier with 15 Requests/Minute) may encounter rate limit pauses (`HTTP 429`) during rapid consecutive PR commits.
- **Paid / Pro / Subscription Plans**: Paid API keys or higher-tier subscription plans (Groq Cloud, NVIDIA NIM, OpenAI Pro, Gemini Pay-As-You-Go) operate with high/unlimited rate limits and zero error pauses.
- **Zero CI Break Guarantee**: If rate limit errors occur on Free Tier keys, ARGUS's built-in **Fallback Static Analysis Engine** automatically completes the PR evaluation using offline static regex parsing without crashing your CI build pipeline.

---

## 🏛️ Mythological Origins & Codebase Mapping

| Symbol | Figure | Greek Name | Role in ARGUS | Code Mapping |
| :---: | :--- | :--- | :--- | :--- |
| 👁️ | **Argus Panoptes** | Ἄργος Πανόπτης | The 100-eyed giant who never slept. Orchestrates the 3-stage PR review pipeline. | [`index.js`](index.js) |
| 🎨 | **Atlas** | Ἄτλας | The Titan holding up the heavens. Maps structural topology using Mermaid.js flowcharts. | [`skills/atlas.js`](skills/atlas.js) |
| 🏛️ | **Athena** | Ἀθηνᾶ | Goddess of wisdom & strategic order. Enforces architectural compliance against `architecture.md`. | [`skills/athena.js`](skills/athena.js) |
| ⚡ | **Hermes** | Ἑρμῆς | Swift messenger god. Scans modified files line-by-line for TODOs, stubs, and secrets. | [`skills/hermes.js`](skills/hermes.js) |

---

## 📜 Origins & History

ARGUS was originally created during the **Deploy Or [Redacted]** Hackathon (hosted by HowToAlgo & GDG KIIT) using **SpecKit** specification-driven development, and has evolved into an active, production-grade automated code review product engineered and maintained under **[Crystal Studio Labs](https://github.com/Crystal-Studio-Labs)**.

---

## 📬 Contact & Support

ARGUS is developed and maintained by **SahooShuvranshu** and **Crystal Studio Labs**:
- 🌐 **Developer Website**: [sahooshuvranshu.is-a.dev](https://sahooshuvranshu.is-a.dev)
- 🏢 **Organization**: [Crystal Studio Labs](https://github.com/Crystal-Studio-Labs)
- 📦 **GitHub Repository**: [Crystal-Studio-Labs/Argus](https://github.com/Crystal-Studio-Labs/Argus)
- 📬 **Email Support**: [contact@sahooshuvranshu.is-a.dev](mailto:contact@sahooshuvranshu.is-a.dev)