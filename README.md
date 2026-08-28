# Dikaios Amanah

> **"Dikaios"** — Greek for *just* or *righteous* · **"Amanah"** — Arabic for *trust* or *trustworthiness*

A university Software Engineering project focused on building a trustworthy, transparent, and auditable platform for business verification, campaign management, and simulated investment.

---

## 📌 Current Status

> **Academic Beta / MVP — Phase 5 Completed**

Dikaios Amanah currently provides an end-to-end workflow connecting:

**Business Owner → Administrator → Retail Investor**

The implemented system includes authentication, role-based access control, business verification, document integrity tracking, campaign moderation, simulated investments, portfolio management, notifications, and a cryptographic trust/audit layer.

---

## 📋 Project Overview

**Dikaios Amanah** is a university Software Engineering Lab project designed around the principles of justice (*dikaios*) and trust (*amanah*).

The platform provides a controlled environment where:

- Business Owners can register and submit their businesses for verification.
- Business Owners can upload verification documents and create investment campaigns after approval.
- Administrators can review businesses, documents, and campaigns.
- Investors can discover verified campaigns and simulate investments.
- Critical platform events are recorded through a tamper-evident cryptographic audit layer.

The project follows a complete Software Engineering lifecycle covering requirements, system design, implementation, security, testing, and deployment preparation.

---

## 👥 System Roles

### Business Owner

Business Owners can:

- Register and authenticate securely.
- Create a business profile.
- Submit business verification requests.
- Upload verification documents.
- Track verification status.
- Create campaigns after business approval.
- Submit profit declarations.

### Administrator

Administrators can:

- Review pending business verifications.
- Approve or reject verification requests.
- Review and moderate campaigns.
- View audit records.
- Verify the integrity of the cryptographic audit ledger.
- Monitor important platform events.

### Retail Investor

Investors can:

- Register and authenticate.
- Browse approved and active campaigns.
- View campaign details.
- View approved business information and profit declarations.
- Make simulated investments.
- Monitor their investment portfolio.

---

## 🔐 Security & Trust

Dikaios Amanah uses multiple security layers:

### JWT Authentication

Authenticated sessions use JSON Web Tokens (JWT).

### Role-Based Access Control

Protected endpoints enforce role-specific permissions:

- `BUSINESS_OWNER`
- `INVESTOR`
- `ADMINISTRATOR`

Both the frontend and backend enforce access restrictions.

### Password Security

Passwords are securely hashed using `bcrypt`.

### Document Integrity

Uploaded verification documents are assigned SHA-256 integrity hashes.

### Cryptographic Audit Chain

Critical events are recorded in an `AuditRecord` ledger.

Each audit record contains:

- Event type
- Entity ID
- User ID
- Timestamp
- Previous hash
- Integrity hash

The integrity hash of each record is linked to the previous record, creating a tamper-evident hash chain.

Administrators can manually verify the ledger and detect unauthorized modifications.

---

## 💰 Simulated Investment Model

The Academic Beta does **not** use real banking APIs or real-money transactions.

When an investor makes an investment:

1. The investment amount is validated.
2. Campaign capacity is checked.
3. An `Investment` record is created.
4. `Campaign.currentFunding` is updated.
5. An audit record is created.
6. Notifications are generated.
7. The operation is performed atomically using a database transaction.

This provides a realistic investment workflow while remaining within the academic MVP scope.

---

## 🧪 Testing

The project includes automated API and integration testing.

### Phase 2 Tests

`backend/test_phase2.js`

Tests include:

- Business Owner registration
- Authentication
- Business creation
- Document upload
- Verification creation
- Verification status
- Audit record creation
- Campaign restrictions
- Protected routes
- Role-based access control

### Phase 4 Tests

`backend/test_phase4.js`

The Retail Investor workflow was verified with **13 integration checks**, including:

- Approved campaign visibility
- Rejection of unapproved campaigns
- Investment validation
- Role restrictions
- Portfolio isolation
- Authentication requirements
- Investment capacity validation
- Atomic investment transactions
- Campaign funding updates
- Audit records
- Notifications
- Localization

### Trust Layer Tamper Demonstration

`backend/test_tamper.js`

A controlled database modification can be simulated to demonstrate that the cryptographic audit chain detects tampering.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Vanilla CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Internationalization | i18next |
| Document Integrity | SHA-256 |
| Trust / Audit | Cryptographic Hash Chain |
| Containerization | Docker Compose |
| API Testing | Node.js Integration Tests |

---

## 📁 Repository Structure

```text
dikaios-amanah/
│
├── README.md
├── DEVELOPMENT_STATUS.md
├── .gitignore
├── docker-compose.yml
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── test_phase2.js
│   ├── test_phase4.js
│   └── test_tamper.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── locales/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
│
└── docs/
    ├── diagrams/
    ├── presentation/
    ├── proposal/
    └── srs/
