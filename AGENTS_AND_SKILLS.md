# ARGUS Agent & Custom Skills System

This document outlines the custom agent definition for **ARGUS** and the execution contract of its three underlying evaluation skills.

## Agent: ARGUS
- **Name**: ARGUS
- **Role**: Automated Code Quality, Architectural Compliance, and Structural Visualization Assistant.
- **Workflow**: Runs sequentially. Takes pull request diffs, executes Atlas to build structural context, Athena to verify architectural compliance, and Hermes to scan for placeholders. Summarizes all outputs into a single PR review.

---

## Custom Skills

### 1. Atlas
- **Interface**: `atlas(diffString)`
- **Behavior**: Parses git diffs to generate a Mermaid.js flowchart mapping the changed components or modified control flow path.
- **File**: `skills/atlas.js`

### 2. Athena
- **Interface**: `athena(diffString, architectureDocs)`
- **Behavior**: Evaluates the diff against `architecture.md` parameters to ensure that all changes adhere to modularity standards and technology stack declarations.
- **File**: `skills/athena.js`

### 3. Hermes
- **Interface**: `hermes(filesList)`
- **Behavior**: Inspects each modified file content for:
  - `// TODO` or `// FIXME` statements.
  - Empty functions or placeholders like `{}`, `pass`, `throw new Error("Not implemented")`, etc.
- **File**: `skills/hermes.js`
