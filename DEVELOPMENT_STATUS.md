# Development Status — Dikaios Amanah

> Last updated: 2026-08-30

This file tracks the current progress through each project phase for the Dikaios Amanah Software Engineering Lab project.

---

## Phase Overview

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Project Proposal | ✅ COMPLETED |
| 2 | Presentation | ✅ COMPLETED |
| 3 | Software Requirements Specification | 🔄 IN PROGRESS |
| 4 | System Design & Diagrams | 📋 PLANNED |
| 5 | Database Design | ✅ COMPLETED |
| 6 | Backend Development | ✅ COMPLETED |
| 7 | Frontend Development | 🔄 IN PROGRESS |
| 8 | Security & Trust/Audit Layer | 📋 PLANNED |
| 9 | Testing | 📋 PLANNED |
| 10 | Deployment | 📋 PLANNED |

---

## Phase Details

### Phase 1 — Project Proposal · ✅ COMPLETED

- Defined project goals, scope, and problem statement.
- Identified stakeholders and high-level requirements.
- Artefacts stored in `docs/proposal/`.

### Phase 2 — Presentation · ✅ COMPLETED

- Delivered project pitch and overview.
- Slides and supporting assets stored in `docs/presentation/`.

### Phase 3 — Software Requirements Specification · 🔄 IN PROGRESS

- Documenting functional and non-functional requirements.
- Identifying use cases, user stories, and system constraints.
- Artefacts will be stored in `docs/srs/`.

### Phase 4 — System Design & Diagrams · 📋 PLANNED

- UML diagrams:
  - Use Case Diagram
  - Activity Diagram
  - Sequence Diagram
  - Class Diagram
  - Deployment Diagram
- Entity-Relationship (ER) diagram.
- Fishbone / Ishikawa analysis diagram.
- Artefacts will be stored in `docs/diagrams/`.

### Phase 5 — Database Schema · ✅ COMPLETED

- **Task:** Translate the Class Diagram into a Prisma ORM schema.
- **Status:** Done.
- **Notes:** Configured for PostgreSQL. Supports authentication, business verification, investor simulated transactions, audits, and notifications.

### Phase 6 — Core Backend API · ✅ COMPLETED

- **Task:** Implement Express server, routes, and controllers.
- **Status:** Done.
- **Notes:** Full JWT/RBAC implementation. Routes are organized into `auth`, `business`, `verification`, `campaign`, `investor`, and `admin`.
- Local storage service handles verification documents securely.

### Phase 7 — Core Frontend UI · 🔄 IN PROGRESS

- **Task:** Implement and refine the React frontend according to the system requirements and UI/activity diagrams.
- **Status:** In progress.
- **Notes:** Premium Vanilla CSS system implemented with bilingual English/Bangla support through `i18next`.
- Specialized dashboards are available for `BUSINESS_OWNER`, `INVESTOR`, and `ADMINISTRATOR`.
- Investor discovery has been expanded through Phase 2 work:
  - Campaign search and filtering.
  - Campaign sorting.
  - Business discovery.
  - Business profiles.
  - Investor campaign and business browsing experience.
- Phase 2D backend API expansion remains unfinished.

### Phase 8 — Security & Trust/Audit Layer · 📋 PLANNED

- Strengthen authentication and role-based access control.
- Implement business-owner and investor verification using appropriate legal documents.
- Implement document verification and integrity checks.
- Continue development of the cryptographic trust and audit layer.
- Ensure important system activities are traceable and tamper-evident.

### Phase 9 — Testing · 📋 PLANNED

- Perform frontend and backend testing.
- Test authentication and role-based access control.
- Test business and investor workflows.
- Test document verification workflows.
- Perform API and integration testing.
- Fix identified bugs and refine the system.

### Phase 10 — Deployment · 📋 PLANNED

- Package and containerize the system.
- Prepare production deployment.
- Configure deployment environment and database.
- Prepare deployment documentation and instructions.
- Deployment scripts will be stored in `scripts/`.

---

## Current Development Status

The core database, backend, and initial frontend system have been implemented.

Current development is focused on **frontend refinement and investor discovery**, while the remaining backend expansion and later security, testing, and deployment work will be completed in their respective phases.

---

## Important Verification Requirement

Dikaios Amanah requires more than basic email-based account verification.

Both **Business Owners** and **Investors** will need to provide appropriate **legal documents** for verification before accessing the relevant trusted platform workflows.

This requirement will be incorporated into the verification and security stages of the project.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔄 | In Progress |
| 📋 | Planned |
| ❌ | Blocked |

---