# Development Status â€” Dikaios Amanah

> Last updated: 2026-08-08

This file tracks the current progress through each project phase for the Dikaios Amanah Software Engineering Lab project.

---

## Phase Overview

| Phase | Description                         | Status         |
|-------|-------------------------------------|----------------|
| 1     | Project Proposal                    | âœ… COMPLETED   |
| 2     | Presentation                        | âœ… COMPLETED   |
| 3     | Software Requirements Specification | ðŸ”„ IN PROGRESS |
| 4     | System Design & Diagrams            | ðŸ“‹ PLANNED     |
| 5     | Database Design                     | ðŸ”„ IN PROGRESS |
| 6     | Backend Development                 | ðŸ”„ IN PROGRESS |
| 7     | Frontend Development                | ðŸ”„ IN PROGRESS |
| 8     | Security & Trust/Audit Layer        | ðŸ“‹ PLANNED     |
| 9     | Testing                             | ðŸ“‹ PLANNED     |
| 10    | Deployment                          | ðŸ“‹ PLANNED     |

---

## Phase Details

### Phase 1 â€” Project Proposal Â· âœ… COMPLETED
- Defined project goals, scope, and problem statement.
- Identified stakeholders and high-level requirements.
- Artefacts stored in `docs/proposal/`.

### Phase 2 â€” Presentation Â· âœ… COMPLETED
- Delivered project pitch and overview.
- Slides and supporting assets stored in `docs/presentation/`.

### Phase 3 â€” Software Requirements Specification Â· ðŸ”„ IN PROGRESS
- Documenting functional and non-functional requirements.
- Identifying use cases, user stories, and system constraints.
- Artefacts will be stored in `docs/srs/`.

### Phase 4 â€” System Design & Diagrams Â· ðŸ“‹ PLANNED
- UML diagrams: Use Case, Activity, Sequence, Class, Deployment.
- Entity-Relationship (ER) diagram.
- Fishbone / Ishikawa analysis diagram.
- Artefacts will be stored in `docs/diagrams/`.

### âœ… Phase 5: Database Schema
- **Task:** Translate Class Diagram into Prisma ORM schema
- **Status:** Done
- **Notes:** Configured for PostgreSQL. Supports full Auth, Business Verification, Investor simulated transactions, Audits, and Notifications.

### âœ… Phase 6: Core Backend API
- **Task:** Implement Express server, routes, and controllers
- **Status:** Done
- **Notes:** Full JWT/RBAC implementation. Routes split into `auth`, `business`, `verification`, `campaign`, `investor`, and `admin`. Local storage service handles verification documents securely.

### âœ… Phase 7: Core Frontend UI
- **Task:** Implement basic React frontend according to Activity/UI diagrams
- **Status:** Done
- **Notes:** Created a Premium Vanilla CSS system. Bilingual support (English/Bangla) via `i18next`. Specialized dashboards for `BUSINESS_OWNER`, `INVESTOR`, and `ADMINISTRATOR` built and tightly coupled to the backend logic.

### âœ… Phase 8: Testing & Refinement
- **Task:** End-to-end testing and bug fixing
- **Status:** Done
- **Notes:** Comprehensive API negative testing (Phases 2 & 4 tests) have passed successfully in the isolated environment.

### âœ… Phase 9: Final Deployment/Handover
- **Task:** Final code clean up and deployment instructions
- **Status:** Done
- **Notes:** Repository structure and README finalized. Academic Trust Layer hash chain implemented. Beta is ready for evaluation.

### Phase 10 â€” Deployment Â· ðŸ“‹ PLANNED
- Package, containerise, and deploy the system.
- Deployment scripts will be stored in `scripts/`.

---

## Legend

| Symbol | Meaning     |
|--------|-------------|
| âœ…     | Completed   |
| ðŸ”„     | In Progress |
| ðŸ“‹     | Planned     |
| âŒ     | Blocked     |
