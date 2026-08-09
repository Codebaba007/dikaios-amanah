# Dikaios Amanah

> **"Dikaios"** (Î´Î¯ÎºÎ±Î¹Î¿Ï‚) â€” Greek for *just* or *righteous* Â· **"Amanah"** â€” Arabic for *trust* or *trustworthiness*

A Software Engineering Lab project focused on building a trustworthy, transparent, and auditable platform for justice and accountability.

---

## ðŸ“Œ Current Phase

> **Phase 5 â€” Trust Layer, Integration & Beta Polish Â· DONE**

---

## ðŸ“‹ Project Overview

**Dikaios Amanah** is a university Software Engineering Lab project aimed at designing and (later) implementing a platform that embodies the principles of justice (*dikaios*) and trust (*amanah*). The project applies a full Software Engineering lifecycle â€” from requirements gathering through design, implementation, testing, and deployment.

This repository serves as the central hub for all project documentation, design artefacts, and (eventually) source code.

---

## ðŸ—‚ï¸ Repository Structure

```
dikaios-amanah/
â”œâ”€â”€ README.md                  â† You are here
â”œâ”€â”€ .gitignore
â”œâ”€â”€ DEVELOPMENT_STATUS.md      â† Project phase tracker
â”‚
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ proposal/              â† Project Proposal documents âœ…
â”‚   â”œâ”€â”€ presentation/          â† Project Presentation materials âœ…
â”‚   â”œâ”€â”€ srs/                   â† Software Requirements Specification ðŸ”„
â”‚   â””â”€â”€ diagrams/              â† UML & system diagrams ðŸ“‹
â”‚       â”œâ”€â”€ use-case/
â”‚       â”œâ”€â”€ activity/
â”‚       â”œâ”€â”€ sequence/
â”‚       â”œâ”€â”€ class/
â”‚       â”œâ”€â”€ deployment/
â”‚       â”œâ”€â”€ er/
â”‚       â””â”€â”€ fishbone/
â”‚
â”œâ”€â”€ frontend/                  â† Web frontend (planned)
â”œâ”€â”€ backend/                   â† Server & API (planned)
â”œâ”€â”€ database/                  â† Schema & migrations (planned)
â”œâ”€â”€ tests/                     â† Test suites (planned)
â””â”€â”€ scripts/                   â† Utility & automation scripts (planned)
```

---

## âœ… Completed Deliverables

| Deliverable         | Status    | Location                   |
|---------------------|-----------|----------------------------|
| Project Proposal    | âœ… Done   | `docs/proposal/`           |
| Project Presentation| âœ… Done   | `docs/presentation/`       |

---

## âœ… Final Deliverables

| Deliverable                  | Status       |
|------------------------------|--------------|
| Software Requirements Spec.  | âœ… Done      |
| UML Diagrams                 | âœ… Done      |
| Database Design              | âœ… Done      |
| Backend Implementation       | âœ… Done      |
| Frontend Implementation      | âœ… Done      |
| Security & Audit Layer       | âœ… Done      |
| Testing                      | âœ… Done      |
| Deployment Preparation       | âœ… Done      |

---

## ðŸ› ï¸ Technology Stack

> âš ï¸ **Note:** The core technology stack has been initialized in Phase 1 (Foundation).

| Layer              | Planned Technology              |
|--------------------|---------------------------------|
| Frontend           | React.js + Vite                 |
| Backend / API      | Node.js + Express               |
| Database           | PostgreSQL (via Prisma ORM)     |
| Authentication     | JWT + bcrypt                    |
| Trust / Audit Layer| Cryptographic Hash Chain Demonstrator |
| Containerisation   | Docker Compose                  |
| CI/CD              | GitHub Actions (TBD)            |

---

## âš ï¸ Academic Beta Limitations

Please note that this is an **Academic Beta / MVP**. The following production-level features are explicitly outside the scope of this implementation per the SRS:
- Real banking integration or real-money transactions (Investments are simulated).
- Production regulatory approvals or financial compliance engines.
- Production AI fraud detection and AI risk prediction.
- **Production Blockchain**: The Permissioned Trust Layer is implemented as an Academic Cryptographic Hash Chain. A full Hyperledger Fabric node network is architectural context for future work.
- Firebase Storage is mocked with a Secure Local Document Storage layer for testing.

---

## ðŸ‘¥ Team

| Role              | Name |
|-------------------|------|
| Project Lead      | â€”    |
| Developer         | â€”    |
| Developer         | â€”    |
| Developer         | â€”    |

> Update this table with your team members.

---

## ðŸ“„ Licence

This project is developed as part of a university Software Engineering Lab course.
Licensing terms will be defined upon project completion.

---

## ðŸ”— Related Documents

- [Development Status](./DEVELOPMENT_STATUS.md)
- [Project Proposal](./docs/proposal/README.md)
- [Project Presentation](./docs/presentation/README.md)
- [SRS](./docs/srs/README.md)
- [Diagrams](./docs/diagrams/)
