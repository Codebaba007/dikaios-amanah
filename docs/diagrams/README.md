# docs/diagrams — UML & System Diagrams

This folder contains all UML and system design diagrams for **Dikaios Amanah**.

## Status: 📋 PLANNED (to be developed as part of SRS)

---

## Diagram Types

| Folder        | Diagram Type                | Purpose                                                          |
|---------------|-----------------------------|------------------------------------------------------------------|
| `use-case/`   | Use Case Diagram            | Shows actors and their interactions with system features         |
| `activity/`   | Activity Diagram            | Illustrates workflow and process flows                           |
| `sequence/`   | Sequence Diagram            | Shows message/event flow between components over time            |
| `class/`      | Class Diagram               | Defines system entities, attributes, and relationships (OOP)     |
| `deployment/` | Deployment Diagram          | Illustrates physical deployment of system components             |
| `er/`         | Entity-Relationship Diagram | Defines database entities and their relationships                |
| `fishbone/`   | Fishbone / Ishikawa Diagram | Root-cause analysis of system problems or risks                  |

---

## File Naming Convention

Use descriptive, lowercase, hyphen-separated names:

```
use-case/uc-user-authentication.png
sequence/seq-submit-complaint.png
er/er-main-schema.png
```

---

## Recommended Tools

| Tool              | Use                                |
|-------------------|------------------------------------|
| draw.io / diagrams.net | General UML diagrams (free)  |
| PlantUML          | Code-based UML generation          |
| Lucidchart        | Collaborative diagramming          |
| dbdiagram.io      | ER diagrams                        |
| StarUML           | Full UML suite                     |

Store both the **source file** (e.g. `.drawio`, `.puml`) and the **exported PNG/PDF** in the relevant subfolder.
