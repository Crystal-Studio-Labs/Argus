# 🛡️ Security Policy for ARGUS

[![Security Policy](https://img.shields.io/badge/SECURITY-POLICY-red?style=for-the-badge)](SECURITY.md)
[![Status](https://img.shields.io/badge/STATUS-ACTIVE-brightgreen?style=for-the-badge)](SECURITY.md)
[![Contact](https://img.shields.io/badge/SECURITY_CONTACT-EMAIL-blue?style=for-the-badge)](mailto:contact@sahooshuvranshu.is-a.dev)

ARGUS takes security seriously. As a GitHub Action executing code review pipelines and handling sensitive pull request data, we strictly enforce security guidelines and secrets protection.

## Supported Versions

Only the latest release and active development branch receive security updates and vulnerability patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

If you discover a potential security vulnerability or secret leakage issue within ARGUS, please report it immediately to our security contact rather than opening a public issue.

### Security Contact
- **Email**: [contact@sahooshuvranshu.is-a.dev](mailto:contact@sahooshuvranshu.is-a.dev)

### Vulnerability Report Guidelines
Please include the following details in your report:
1. Description of the vulnerability or secret handling issue.
2. Steps to reproduce the issue (including sample workflow configs or PR payloads if applicable).
3. Impact assessment and suggested resolution.

We will acknowledge receipt of your vulnerability report within 24–48 hours and work with you to patch and disclose the issue responsibly.

## Security Constraints & Secrets Protection

- **No Secrets Exposure**: ARGUS agents are strictly forbidden from outputting API keys, tokens, or environment credentials into GitHub PR comments or workflow logs.
- **Scope Restriction**: ARGUS only processes files modified within the pull request diff and does not access external private assets without explicit workflow authorization.
