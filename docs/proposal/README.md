# docs/proposal — Project Proposal

This folder contains all artefacts related to the **Dikaios Amanah** Project Proposal.

## Status: ✅ COMPLETED

---

## Contents

| Path           | Description                                   |
|----------------|-----------------------------------------------|
| `latex/`       | LaTeX source files for the proposal document  |
| `pdf/`         | Compiled PDF version of the proposal          |

---

## Proposal Summary

The project proposal defined:

- **Problem Statement** — The need for a trustworthy and auditable platform.
- **Project Scope** — Boundaries of what the system will and will not do.
- **Stakeholders** — Identified key users and affected parties.
- **High-Level Requirements** — Initial list of system requirements.
- **Proposed Technology Stack** — Preliminary technology choices (subject to revision in SRS).

---

## How to Compile (LaTeX)

```bash
cd latex/
pdflatex main.tex
bibtex main       # if references are used
pdflatex main.tex
pdflatex main.tex
```

The compiled PDF will be output to the `pdf/` folder.
