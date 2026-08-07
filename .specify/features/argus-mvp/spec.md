# Feature Specification: ARGUS AI GitHub Action MVP

## Executive Summary
ARGUS is an autonomous AI-powered GitHub Action for Track B (Developer Productivity Tools) that automates PR reviews using a 3-stage pipeline: Atlas (Visual Topology), Athena (Architecture Compliance), and Hermes (Technical Debt Scanner).

## User Stories & Requirements

### User Story 1 — Structural Visualization (Atlas)
As a code reviewer, I want a visual topology flowchart of modified PR files so I can quickly understand architectural impacts.

### User Story 2 — Architectural Guardrails (Athena)
As a lead architect, I want code changes automatically evaluated against `architecture.md` rules so architectural decay is prevented.

### User Story 3 — Technical Debt Prevention (Hermes)
As an engineering manager, I want `// TODO`, `// FIXME`, empty stub functions, and hardcoded secrets flagged on PRs so unfinished code is never merged into `main`.

## Acceptance Criteria
1. Executes on GitHub Actions `pull_request` events.
2. Supports Google Gemini API (`gemini-2.0-flash`) and NVIDIA OpenAI-compatible API endpoints.
3. Provides fallback static analysis when no LLM API key is connected.
4. Posts an idempotent single review comment containing an Executive Scorecard and collapsible topology diagrams.
5. Achieves 100% green CI pipeline with native `node --test` suite.
