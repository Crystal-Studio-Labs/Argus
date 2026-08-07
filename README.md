# 👁️ ARGUS — AI-Powered GitHub Action for Automated Code Reviews

ARGUS is an autonomous AI agent built for **Track B (Developer Productivity Tools)** of the Agent-Driven Software Lifecycle hackathon. It evaluates Pull Requests using a 3-stage pipeline to generate structural visual diagrams, enforce architectural compliance, and scan for unfinished code stubs.

---

## 🌟 Key Features

- **🎨 Stage 1 — Atlas (Visualizer)**: Automatically converts git diffs into clean Mermaid.js flowcharts to render structural code changes directly in PR comments.
- **🏛️ Stage 2 — Athena (Compliance Guard)**: Validates code changes against rules defined in `architecture.md` to ensure stack adherence and structural standards.
- **✉️ Stage 3 — Hermes (Code Scanner)**: Scans modified files for `// TODO`, `// FIXME`, and empty placeholder function bodies.

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml             # CI workflow (install, lint, test, structure check)
├── skills/
│   ├── atlas.js               # Git diff -> Mermaid.js flowchart function
│   ├── athena.js              # Compliance check against architecture.md
│   └── hermes.js              # Static + LLM scan for TODOs/FIXMEs/placeholders
├── action.yml                 # GitHub Action definition metadata
├── architecture.md            # Tech stack & 3-stage evaluation pipeline documentation
├── AGENTS.md                  # Agent constitution, constraints, and rule matrix
├── AGENTS_AND_SKILLS.md       # ARGUS custom agent and skills contract
├── index.js                   # Core Action entry point & sequential execution logic
├── package.json               # Action dependencies and script definitions
└── test.js                    # Unit test runner for ARGUS skills
```

---

## 🚀 Usage in GitHub Workflows

Add ARGUS to your repository workflow (e.g. `.github/workflows/argus.yml`):

```yaml
name: ARGUS Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run ARGUS Code Review
        uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          gemini-api-key: ${{ secrets.GEMINI_API_KEY }}
```

---

## 🧪 Local Testing & Verification

```bash
# Install dependencies
npm install

# Run syntax linting
npm run lint

# Run unit test suite
npm test
```