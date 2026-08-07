# ARGUS Architecture & System Specification

## Technology Stack
* **Runtime Environment**: Node.js GitHub Action (Node 20+)
* **AI Model Engine**: Google Gemini API (`@google/genai` SDK) / NVIDIA API
* **Workflow Automation**: `@actions/core`, `@actions/github`

## 3-Stage Evaluation Pipeline

1. **Atlas (Visualizer Stage)**:
   - Converts PR git diffs into a Mermaid.js flowchart mapping changed modules, modified paths, and control flow changes.
   - File: `skills/atlas.js`

2. **Athena (Compliance Guard Stage)**:
   - Validates code changes against rules and stack declarations in `architecture.md`.
   - File: `skills/athena.js`

3. **Hermes (Unfinished Code Scanner Stage)**:
   - Scans modified files for `// TODO`, `// FIXME`, empty functions, and placeholder implementation stubs.
   - File: `skills/hermes.js`
