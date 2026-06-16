# Security Policy

## Security & Data Privacy Architecture

The **UNPOL Capacity-Building & Development (CBD) Planning Tool** is designed with a strict **client-side-only architecture**. 
- **No Remote Transmission**: No planning data, situational analysis, stakeholder mapping, or capacity matrices are transmitted to external servers or remote endpoints.
- **Local Browser Storage**: All data entered is stored exclusively within your local browser's storage (`localStorage`). Clearing your browser cache or resetting the module from the UI will delete this data.
- **Local File Operations**: Workspace backup/import and Markdown exports are processed entirely locally in the browser memory.

> [!WARNING]
> **Operational Data Caveat**
> Despite the client-side design, do not enter sensitive, classified, or restricted host-state security or mission details into public web deployments of this tool. If utilizing this tool for sensitive planning tasks, deploy and run it locally on an isolated, secure machine.

---

## Supported Versions

Security updates are actively applied to the following versions:

| Version | Supported |
| ------- | --------- |
| >= 0.3.x| Yes       |
| < 0.3.x | No        |

## Reporting a Vulnerability

We take the security of this planning prototype seriously. If you find a security vulnerability, please do not disclose it publicly in issues or discussions. Instead, follow these steps:

1. Draft a report detailing the vulnerability, steps to reproduce it, and the potential impact.
2. Send the report directly to the maintainer via email or via a secure channel (if deploying in a mission context, contact the local system administrator).
3. I will aim to acknowledge receipt within a reasonable timeframe and coordinate a patch where appropriate.

Thank you for helping keep this tool secure.
