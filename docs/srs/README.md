# docs/srs — Software Requirements Specification

This folder contains all artefacts related to the **Dikaios Amanah** Software Requirements Specification (SRS).

## Status: 🔄 IN PROGRESS

---

## Contents

| Path      | Description                                    |
|-----------|------------------------------------------------|
| `latex/`  | LaTeX source files for the SRS document        |
| `pdf/`    | Compiled PDF version of the SRS                |

---

## SRS Structure (Planned)

The SRS will follow a standard structure, covering:

1. **Introduction**
   - Purpose, scope, definitions, acronyms
   - Overview of the document

2. **Overall Description**
   - Product perspective and context
   - Product functions (high-level)
   - User classes and characteristics
   - Operating environment
   - Assumptions and dependencies

3. **Functional Requirements**
   - Use cases and user stories
   - Feature specifications

4. **Non-Functional Requirements**
   - Performance, security, reliability, usability, scalability

5. **System Constraints**
   - Legal, regulatory, and technical constraints

6. **External Interface Requirements**
   - User, hardware, software, and communication interfaces

7. **Appendices**
   - Glossary, references, supporting diagrams

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
