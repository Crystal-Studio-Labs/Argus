# 👁️ ARGUS — Automated AI Code Reviewer & Architecture Guardian

[![CI Pipeline](https://img.shields.io/badge/CI_PIPELINE-PASSED-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com/SahooShuvranshu/Argus/actions/workflows/ci.yml)
[![Marketplace](https://img.shields.io/badge/MARKETPLACE-ARGUS_AI_CODE_REVIEWER-purple?style=for-the-badge&logo=github)](https://github.com/marketplace/actions/argus-ai-code-reviewer)
[![Node.js](https://img.shields.io/badge/NODE.JS-%3E%3D20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/LICENSE-MIT-yellow?style=for-the-badge)](LICENSE)
[![Track B](https://img.shields.io/badge/TRACK_B-DEVELOPER_PRODUCTIVITY-blue?style=for-the-badge)](#-hackathon-context--acknowledgments)

> **ARGUS** is an autonomous, agentic GitHub Action powered primarily by **Google Gemini** (`gemini-2.0-flash`) with universal OpenAI cloud compatibility. Operating as an automated Senior Software Architect, ARGUS executes a 3-stage evaluation pipeline on Pull Requests to generate visual topology flowcharts, enforce architectural compliance, and catch technical debt before code merges into `main`.

---

## 🏛️ Mythological Inspiration & Codebase Mapping

The naming and architecture of ARGUS and its three skills are directly inspired by ancient Greek mythology:

- **👁️ ARGUS (Argus Panoptes - Ἄργος Πανόπτης)**: The 100-eyed all-seeing giant who never slept. In this codebase ([`index.js`](file:///D:/Projects/Argus/index.js)), ARGUS is the 100-eye all-seeing PR reviewer watching over every pull request event to prevent bugs, architectural decay, and unfinished code from slipping into production.
- **🎨 Atlas (Ἄτλας)**: The Titan who holds up the celestial heavens. In this codebase ([`skills/atlas.js`](file:///D:/Projects/Argus/skills/atlas.js)), Atlas parses raw git diffs and draws visual Mermaid.js flowcharts (`flowchart TD`) showing how modified code paths and file structures hold up the system topology.
- **🏛️ Athena (Ἀθηνᾶ)**: The Greek goddess of wisdom and strategy. In this codebase ([`skills/athena.js`](file:///D:/Projects/Argus/skills/athena.js)), Athena acts as the strategic Architecture Guardian, cross-referencing PR code changes against [`architecture.md`](file:///D:/Projects/Argus/architecture.md) rules to enforce clean architectural boundaries.
- **⚡ Hermes (Ἑρμῆς)**: The swift, wing-footed messenger god who inspects hidden corners. In this codebase ([`skills/hermes.js`](file:///D:/Projects/Argus/skills/hermes.js)), Hermes swiftly inspects modified files line-by-line, discovering hidden secrets, `// TODO` comments, debug `console.log` statements, and empty function stubs with severity warning badges (`🔴 BLOCK`, `🟡 WARN`, `🔵 INFO`).

---

## 🗺️ Architectural Workflow

```mermaid
flowchart TD
    PR["GitHub Pull Request Event"] --> Index["index.js (Orchestrator)"]
    
    subgraph Pipeline ["ARGUS 3-Stage Evaluation Pipeline"]
        Index --> Stage1["🎨 Stage 1: Atlas (Visualizer)"]
        Index --> Stage2["🏛️ Stage 2: Athena (Architecture Guard)"]
        Index --> Stage3["⚡ Stage 3: Hermes (Debt & Security Scanner)"]
    end
    
    Stage1 --> Skills["skills/atlas.js"]
    Stage2 --> Skills2["skills/athena.js"]
    Stage3 --> Skills3["skills/hermes.js"]
    
    Skills & Skills2 & Skills3 --> LLM["Google Gemini (Default) / OpenAI Compatible Cloud Provider"]
    Pipeline --> Scorecard["Idempotent PR Review Comment & Scorecard"]
```

---

## 🌟 3-Stage Evaluation Pipeline

| Stage | Module | Purpose & Output |
| :--- | :--- | :--- |
| **🎨 Stage 1: Atlas** | [`skills/atlas.js`](file:///D:/Projects/Argus/skills/atlas.js) | Parses PR diffs into an interactive **Mermaid.js flowchart** (`flowchart TD`) mapping changed files, modules, and control flows. |
| **🏛️ Stage 2: Athena** | [`skills/athena.js`](file:///D:/Projects/Argus/skills/athena.js) | Cross-references code changes against [`architecture.md`](file:///D:/Projects/Argus/architecture.md) rules to prevent architectural decay and layering violations. |
| **⚡ Stage 3: Hermes** | [`skills/hermes.js`](file:///D:/Projects/Argus/skills/hermes.js) | Scans changed files for `// TODO`, `// FIXME`, empty placeholder function stubs, debug logs, and hardcoded API keys/secrets with severity badges (`🔴 BLOCK`, `🟡 WARN`, `🔵 INFO`). |

---

## 🌐 Universal AI Cloud Provider Compatibility (Google Gemini Primary Default)

ARGUS is powered by **Google Gemini** (`gemini-2.0-flash`) by default, while supporting **any OpenAI-compatible AI Cloud Provider** out-of-the-box using standard inputs:

| AI Provider | Base URL (`base-url`) | Default / Sample Model (`model`) | Key Required |
| :--- | :--- | :--- | :--- |
| **Google Gemini** *(Default)* | *Not needed (Native SDK)* | `gemini-2.0-flash`, `gemini-1.5-flash` | `gemini-api-key` |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini`, `gpt-4o` | `api-key` |
| **NVIDIA NIM** | `https://integrate.api.nvidia.com/v1` | `meta/llama-3.3-70b-instruct` | `api-key` |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `google/gemini-2.0-flash-001`, `deepseek/deepseek-r1` | `api-key` |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | `api-key` |

*Note: Includes a built-in **Fallback Static Analysis Engine** that runs automatically if no LLM key is supplied or during network interruptions.*

---

## 🚀 Quick Start & Workflow Setup

Add ARGUS to your repository by creating `.github/workflows/argus.yml`.

### Option A: Google Gemini API (Recommended Default — No `base-url` required)

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

      - name: Run ARGUS AI Reviewer (Google Gemini)
        uses: SahooShuvranshu/Argus@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

---

### Option B: Universal OpenAI-Compatible Cloud Provider (NVIDIA / OpenRouter / Groq / OpenAI)

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

      - name: Run ARGUS AI Reviewer (NVIDIA NIM / OpenRouter / Groq)
        uses: SahooShuvranshu/Argus@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.NVIDIA_API_KEY }}               # or OPENROUTER_API_KEY / OPENAI_API_KEY
          base-url: "https://integrate.api.nvidia.com/v1"      # or https://openrouter.ai/api/v1 / https://api.groq.com/openai/v1
          model: "meta/llama-3.3-70b-instruct"                 # or google/gemini-2.0-flash-001 / llama-3.3-70b-versatile
```

---

## 📂 Repository Directory Tree

```
├── .github/
│   └── workflows/
│       ├── argus.yml          # ARGUS PR review workflow trigger
│       └── ci.yml             # Repository CI pipeline (lint, test, structure check)
├── skills/
│   ├── atlas.js               # Visual topology mapper (Git diff -> Mermaid.js)
│   ├── athena.js              # Architecture compliance guard
│   └── hermes.js              # Technical debt, secret, and stub function scanner
├── tests/
│   └── skills.test.js         # Native unit test suite (node --test)
├── action.yml                 # GitHub Action metadata declaration
├── architecture.md            # Tech stack & 3-stage evaluation specification
├── AGENTS.md                  # Agent constitution, operating rules, and rule matrix
├── AGENTS_AND_SKILLS.md       # ARGUS custom agent and skills contract (Greek myth mapping)
├── index.js                   # Core GitHub Action orchestrator script
├── package.json               # Dependencies and script definitions
├── README.md                  # Master documentation and quick start guide
├── SECURITY.md                # Security disclosure policy and contact
├── CONTRIBUTING.md            # Contributor guidelines and environment setup
└── CODE_OF_CONDUCT.md         # Community pledge and enforcement rules
```

---

## 🧪 Local Setup & Test Execution

```bash
# Clone the repository
git clone https://github.com/SahooShuvranshu/Argus.git
cd Argus

# Install dependencies
npm install

# Run syntax linting
npm run lint

# Run native test suite (node --test)
npm test
```

---

## 🏆 Hackathon Context & Acknowledgments

This project was created for the **[Deploy Or [Redacted]](https://dor.gdgkiit.in/)** Hackathon hosted by **HowToAlgo** and **GDG KIIT**.

- **Hackathon**: [Deploy Or [Redacted]](https://dor.gdgkiit.in/)
- **GDG Event Page**: [GDG KIIT Event Details](https://gdg.community.dev/events/details/google-gdg-on-campus-kalinga-institute-of-industrial-technology-bhubaneswar-india-presents-deploy-or-redacted/)
- **Organizers**: HowToAlgo & GDG KIIT
- **Track**: Developer Productivity Tools

---

## 📄 Documentation & Community Policies

- 📜 [**Architecture Specification**](architecture.md): Detailed tech stack, data flow, and pipeline architecture.
- ⚖️ [**Agent Constitution**](AGENTS.md): Core operating principles, constraints, and rule matrix (`ARGUS-01`, `ARGUS-02`, `ARGUS-03`).
- 🤖 [**Custom Agent & Skills System**](AGENTS_AND_SKILLS.md): Skill interface definitions for Atlas, Athena, and Hermes with mythological origins.
- 🤝 [**Contributing Guidelines**](CONTRIBUTING.md): Guide for contributors and development setup.
- 🛡️ [**Security Policy**](SECURITY.md): Security reporting procedures and supported versions.
- 📜 [**Code of Conduct**](CODE_OF_CONDUCT.md): Community standards and pledge.

---

## 📬 Contact & Support

For inquiries, support, or security reports, please contact:
- **Email**: [contact@sahooshuvranshu.is-a.dev](mailto:contact@sahooshuvranshu.is-a.dev)
- **Repository Owner**: [SahooShuvranshu](https://github.com/SahooShuvranshu)