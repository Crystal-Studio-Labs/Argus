# 🏛️ ARGUS Architecture & System Specification

[![ARGUS Action](https://img.shields.io/badge/ARGUS-Architecture%20Spec-purple)](file:///D:/Projects/Argus/architecture.md)
[![Pipeline](https://img.shields.io/badge/Pipeline-3--Stage%20(Atlas%2C%20Athena%2C%20Hermes)-blue)](file:///D:/Projects/Argus/architecture.md)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green)](https://nodejs.org/)

## Technology Stack
* **Runtime Environment**: Node.js GitHub Action (Node 20+)
* **Universal AI Provider Engine**: OpenAI-compatible SDK (`openai` package) supporting:
  - **OpenAI**: `https://api.openai.com/v1` (models: `gpt-4o-mini`, `gpt-4o`)
  - **NVIDIA NIM**: `https://integrate.api.nvidia.com/v1` (models: `meta/llama-3.3-70b-instruct`)
  - **OpenRouter**: `https://openrouter.ai/api/v1` (models: `google/gemini-2.0-flash-001`, `deepseek/deepseek-r1`)
  - **Groq**: `https://api.groq.com/openai/v1` (models: `llama-3.3-70b-versatile`)
  - **Google Gemini**: Native `@google/genai` SDK / OpenAI Endpoint
* **Workflow Automation**: `@actions/core`, `@actions/github`

## 3-Stage Evaluation Pipeline

1. **Atlas (Visualizer Stage)**:
   - Converts PR git diffs into a Mermaid.js flowchart mapping changed modules, modified paths, and control flow changes.
   - File: `skills/atlas.js`

2. **Athena (Compliance Guard Stage)**:
   - Validates code changes against rules and stack declarations in `architecture.md`.
   - File: `skills/athena.js`

3. **Hermes (Unfinished Code Scanner Stage)**:
   - Scans modified files for `// TODO`, `// FIXME`, empty functions, security leaks, and placeholder implementation stubs.
   - File: `skills/hermes.js`
