# Contributing to UNPOL CBD Planning Tool

Thank you for your interest in contributing to the **UNPOL Capacity-Building & Development (CBD) Integrated Planning Tool**! This project is an early-stage, open-source tool designed to support UNPOL Advisory Teams, SSR specialists, and peace operations planning officers.

To maintain the quality, professional tone, and purpose of this tool, please review the following guidelines before contributing.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors to maintain a professional, respectful, and constructive tone.

## Domain Focus & Tone

This is a specialized tool for peace operations, UNPOL, community-based policing, and public-sector planning.
- **Tone**: Keep wording clear, objective, evidence-based, and practitioner-oriented. Avoid exaggerated claims or hyperbole.
- **Privacy & Security**: Never input or commit actual classified, restricted, or sensitive host-state security details to the codebase, public issues, or demo sites. All planning data must run client-side.

## Getting Started

### 1. Fork and Clone
Fork the repository on GitHub, then clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/unpol-cbd-planning-tool.git
cd unpol-cbd-planning-tool
```

### 2. Install Dependencies
Make sure you have Node.js (version 18 or later recommended) installed.
```bash
npm install
```

### 3. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Making Changes

- **No Core Architecture Rewrites**: Focus on fixing issues, adding templates, improving documentation, or adding self-contained planning components. Do not rewrite the core architecture without prior discussion in an issue.
- **Clean Code & Linting**: We use ESLint and TypeScript for code quality. Before submitting your changes, run:
  ```bash
  npm run lint
  npm run build
  ```
  Ensure there are no TypeScript compiler or linter errors.

## Submission Process

1. **Create a Branch**: Create a descriptive branch name from `main` (e.g., `feature/pestel-templates` or `fix/export-margins`).
2. **Commit Message Guidelines**: Use clear, concise commit messages. Reference issue numbers where applicable.
3. **Open a Pull Request**: Submit your pull request to the main repository. Follow the [Pull Request Template](.github/pull_request_template.md).
4. **Code Review**: A maintainer will review your changes. Be prepared to address feedback.

## Questions or Feedback?
If you have questions about the UNPOL CBD Planning framework or technical implementation details, please open a discussion or file a documentation issue.
