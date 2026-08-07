# 🤖 ARGUS Agent & Custom Skills System

[![Skills System](https://img.shields.io/badge/ARGUS-SKILLS_SYSTEM-purple?style=for-the-badge)](AGENTS_AND_SKILLS.md)
[![Atlas](https://img.shields.io/badge/SKILL-ATLAS-blue?style=for-the-badge)](skills/atlas.js)
[![Athena](https://img.shields.io/badge/SKILL-ATHENA-brightgreen?style=for-the-badge)](skills/athena.js)
[![Hermes](https://img.shields.io/badge/SKILL-HERMES-yellow?style=for-the-badge)](skills/hermes.js)

This document outlines the custom agent definition for **ARGUS** and the execution contract of its three underlying evaluation skills.

---

## 🏛️ Mythological Origins & Codebase Mapping

The naming and architecture of ARGUS and its three skills are directly inspired by ancient Greek mythology:

1. **ARGUS (Argus Panoptes - Ἄργος Πανόπτης)**:
   - *Mythology*: In Greek mythology, Argus was a giant with **100 eyes** who never slept all at once (some eyes were always awake and watching). He was the ultimate all-seeing guardian.
   - *Codebase Implementation*: **ARGUS** ([`index.js`](file:///D:/Projects/Argus/index.js)) acts as the 100-eye all-seeing guardian over GitHub Pull Requests. It never sleeps, automatically inspecting every PR event with multi-eyed precision to prevent bugs, architectural decay, and unfinished code from slipping into `main`.

2. **Atlas (Ἄτλας)**:
   - *Mythology*: The Titan condemned to hold up the celestial heavens and map the structure of the cosmos on his shoulders.
   - *Codebase Implementation*: [`skills/atlas.js`](file:///D:/Projects/Argus/skills/atlas.js) maps the structural topology of your code! Just as Atlas carries the map of the heavens, Atlas parses raw git diffs and draws visual Mermaid.js flowcharts (`flowchart TD`) showing how modified code paths and file structures hold up the system architecture.

3. **Athena (Ἀθηνᾶ)**:
   - *Mythology*: The ancient Greek goddess of **wisdom, strategy, and warfare**. She protected cities with strategic rules, disciplined order, and defensive shield armor (Aegis).
   - *Codebase Implementation*: [`skills/athena.js`](file:///D:/Projects/Argus/skills/athena.js) acts as the strategic **Architecture Guardian**. Athena evaluates code diffs against [`architecture.md`](file:///D:/Projects/Argus/architecture.md) rules, ensuring strategic compliance, preventing modular decay, and enforcing clean architectural boundaries.

4. **Hermes (Ἑρμῆς)**:
   - *Mythology*: The swift, wing-footed messenger god who traveled everywhere, inspecting dark corners, discovering hidden secrets, and delivering warnings.
   - *Codebase Implementation*: [`skills/hermes.js`](file:///D:/Projects/Argus/skills/hermes.js) is the **Technical Debt & Security Sweeper**. Hermes swiftly inspects every changed file line-by-line, discovering hidden secrets, `// TODO` comments, debug `console.log` statements, and empty function placeholders, delivering immediate warning badges (`🔴 BLOCK`, `🟡 WARN`, `🔵 INFO`).

---

## Agent Definition: ARGUS
- **Name**: ARGUS
- **Role**: Automated Code Quality, Architectural Compliance, and Structural Visualization Assistant.
- **Workflow**: Runs sequentially. Takes pull request diffs, executes Atlas to build structural context, Athena to verify architectural compliance, and Hermes to scan for placeholders. Summarizes all outputs into a single PR review.

---

## Custom Skills

### 1. Atlas
- **Interface**: `generateTopologyMap(diffText, aiClient, modelName)`
- **Behavior**: Parses git diffs to generate a Mermaid.js flowchart mapping the changed components or modified control flow path.
- **File**: `skills/atlas.js`

### 2. Athena
- **Interface**: `evaluateArchitecture(diffText, architectureDocs, aiClient, modelName)`
- **Behavior**: Evaluates the diff against `architecture.md` parameters to ensure that all changes adhere to modularity standards and technology stack declarations.
- **File**: `skills/athena.js`

### 3. Hermes
- **Interface**: `detectTechnicalDebt(fileContentsMap, aiClient, modelName)`
- **Behavior**: Inspects each modified file content for:
  - `// TODO` or `// FIXME` statements.
  - Hardcoded secrets and leftover debug `console.log` statements.
  - Empty functions or placeholders like `{}`, `pass`, `throw new Error("Not implemented")`, etc.
- **File**: `skills/hermes.js`
