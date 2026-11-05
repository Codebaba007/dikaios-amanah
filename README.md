````markdown
# Dikaios Amanah

### A Secure, Transparent and Ethical SME Investment Platform Based on Musharakah Principles

<p align="center">
  <strong>Connecting Small and Medium Enterprises with Investors Through a Transparent, Partnership-Based Investment Model.</strong>
</p>

<p align="center">
  <a href="https://dikaios-amanah-web.onrender.com">Live Application</a> |
  <a href="https://github.com/codebaba007/dikaios-amanah">GitHub Repository</a>
</p>

---

## 1. Project Overview

Dikaios Amanah is an academic software project designed to explore how technology can facilitate ethical and transparent investment opportunities for Small and Medium Enterprises (SMEs).

The platform is based on the principles of **Musharakah**, an Islamic partnership-based financing model in which multiple parties contribute capital toward a shared business venture and participate in its outcomes according to mutually agreed terms.

The primary objective of Dikaios Amanah is to establish a centralized digital environment where business owners can present investment opportunities, investors can discover and evaluate campaigns, and administrators can oversee verification and platform activities.

The system emphasizes transparency, accountability, structured verification, and document integrity throughout the investment process.

**Project Scope:** Dikaios Amanah is developed as an academic Minimum Viable Product (MVP). Investment activities are simulated for demonstration and educational purposes. The platform does not process real financial transactions or operate as a live investment service.

## 2. Project Objectives

The primary objectives of the project are:

- To develop a digital platform connecting SMEs with prospective investors.
- To explore the application of Musharakah principles in a technology-driven investment environment.
- To provide structured business and investment campaign management.
- To introduce role-based access and administrative oversight.
- To implement verification workflows for businesses and investors.
- To improve accountability through document integrity checks and audit records.
- To provide a centralized interface for managing investment-related activities.

## 3. Key Features

### 3.1 Role-Based Access Control

The platform supports three primary user roles, each with dedicated functionality.

| User Role | Responsibilities |
|---|---|
| Business Owner | Manage business information, submit investment campaigns, and access business-related features. |
| Investor | Explore investment campaigns, complete verification-related steps, and view portfolio information. |
| Administrator | Review verification submissions, manage campaign reviews, and oversee platform activities. |

### 3.2 Business and Campaign Management

- Business profile management.
- Investment campaign submission.
- Campaign discovery and browsing.
- Structured presentation of business and campaign information.
- Administrative campaign review workflows.

### 3.3 Investor Management

- Investor registration and authentication.
- Identity verification workflow.
- Investment campaign exploration.
- Simulated investment interactions.
- Portfolio-related information.

### 3.4 Verification and Administration

- Business verification workflows.
- Investor verification workflows.
- Administrative review interfaces.
- Campaign review and management.
- Audit log visibility for platform activities.

### 3.5 Data Integrity and Auditability

The platform incorporates integrity-focused mechanisms to support accountability and traceability.

These include:

- SHA-256 hashing for document integrity checks.
- Hash-linked audit records.
- Structured records of relevant platform activities.

These mechanisms support the detection of changes to recorded information and improve traceability. They are application-level integrity mechanisms and should not be interpreted as a distributed blockchain or a guarantee of absolute immutability.

## 4. Technology Stack

The project uses the following technologies:

| Component | Technology |
|---|---|
| Frontend Framework | React |
| Frontend Build Tool | Vite |
| Programming Language | JavaScript |
| UI Styling | CSS |
| Icon Library | Lucide React |
| Client-Side Routing | React Router |
| Internationalization | i18next, react-i18next |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| Object-Relational Mapping | Prisma |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| File Storage | Local Storage / S3-Compatible Storage |
| End-to-End Testing | Playwright |
| Deployment Platform | Render |

## 5. System Architecture

Dikaios Amanah follows a client-server architecture that separates the frontend presentation layer from backend application logic and database operations.

The React frontend communicates with the Express.js backend through HTTP API requests. The backend handles authentication, business logic, campaign operations, verification workflows, and database interactions through Prisma ORM.

### Architecture Overview

```text
                 WEB CLIENT
                     |
                     |
              React + Vite
                     |
                     | HTTP API Requests
                     |
              Express.js API
                     |
          +----------+----------+
          |          |          |
      Authentication Business  Verification
          |        Logic        |
          +----------+----------+
                     |
                 Prisma ORM
                     |
                 PostgreSQL
                     |
          Application Data and
             Audit Records
```

This architecture provides a modular foundation for separating application responsibilities and maintaining the interaction between the client, server, and database.

## 6. Repository Structure

The repository is organized into separate frontend and backend applications.

```text
dikaios-amanah/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── scripts/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── locales/
│   │
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── scripts/
│   └── smoke-test.mjs
│
├── docker-compose.yml
├── render.yaml
├── DEPLOYMENT.md
└── README.md
```

This structure presents the primary application directories. Additional files and subdirectories are maintained within their respective modules.

## 7. Installation and Local Setup

Follow the instructions below to configure and run the project locally.

### 7.1 Prerequisites

Ensure that the following software is installed:

- Node.js (version 18 or later)
- npm
- PostgreSQL
- Git

### 7.2 Clone the Repository

```bash
git clone https://github.com/codebaba007/dikaios-amanah.git
cd dikaios-amanah
```

### 7.3 Backend Configuration

Navigate to the backend directory:

```bash
cd backend
```

Install the required dependencies:

```bash
npm ci
```

Create a local environment configuration file:

```bash
cp .env.example .env
```

Configure the environment variables in `backend/.env`.

Example configuration:

```env
DATABASE_URL="postgresql://admin:password@localhost:5433/dikaios_amanah?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET="replace-with-a-long-random-secret"
FRONTEND_URL="http://localhost:5173"
STORAGE_DRIVER=local
```

Make sure that PostgreSQL is running and the corresponding database has been created.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply the available database migrations:

```bash
npx prisma migrate deploy
```

Start the backend development server:

```bash
npm run dev
```

The backend will normally be available at:

```text
http://localhost:5000
```

### 7.4 Frontend Configuration

Open a separate terminal and navigate to the frontend directory from the project root:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm ci
```

Create the frontend environment configuration file:

```bash
cp .env.example .env
```

Configure the backend API address:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## 8. Environment Variables

The frontend and backend use separate environment configuration files.

### 8.1 Backend Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL database connection string. |
| `DIRECT_URL` | Optional direct database connection configuration. |
| `PORT` | Port used by the backend server. |
| `NODE_ENV` | Application execution environment. |
| `JWT_SECRET` | Secret used for JSON Web Token signing. |
| `FRONTEND_URL` | Permitted frontend origin. |
| `STORAGE_DRIVER` | Determines the configured file storage mechanism. |
| S3-related variables | Configuration for an S3-compatible storage provider. |

### 8.2 Frontend Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API. |

**Security Consideration:** Never commit production credentials, database passwords, JWT secrets, or private storage keys to the repository. Use the provided example environment files as configuration templates.

## 9. Running the Application

After starting both development servers:

1. Open the frontend application in a web browser.
2. Register or sign in through the available authentication interface.
3. Access the platform according to the permissions associated with the account role.
4. Explore the available business, campaign, investor, and administrative workflows.

Certain features require appropriately configured database records and user permissions.

## 10. Deployment

The project includes deployment configuration for Render.

### Live Application

**Frontend Application:**

https://dikaios-amanah-web.onrender.com

**Backend API:**

https://dikaios-amanah-api.onrender.com

Additional deployment instructions are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

Production deployment requires appropriate configuration of:

- Database connection variables.
- Authentication secrets.
- Frontend and backend service URLs.
- File storage settings.
- Environment-specific application configuration.

**Storage Consideration:** Local filesystem storage on hosted services may be ephemeral. Persistent storage or an S3-compatible storage provider should be configured when uploaded files must remain available across service redeployments.

## 11. Testing

The project includes end-to-end testing using Playwright.

The testing workflow is intended to verify important application interactions and user-facing functionality.

Additional testing and validation are necessary to establish the reliability of individual workflows and the overall system.

## 12. Project Limitations

Dikaios Amanah is developed as an academic MVP. Its current scope has several limitations:

- Investment interactions are simulated and do not transfer real funds.
- The platform is not a licensed financial service.
- Document integrity mechanisms use application-level hashing and audit records rather than a distributed blockchain.
- Verification workflows demonstrate platform functionality and do not constitute official identity or regulatory certification.
- Production deployment requires additional security review, operational monitoring, and storage configuration.

## 13. Future Development

Potential areas for further development include:

- More comprehensive automated testing.
- Enhanced business and investor verification workflows.
- Expanded administrative review and reporting capabilities.
- Improved audit and traceability mechanisms.
- More robust production-grade file storage.
- Additional security hardening and performance optimization.
- Further refinement of the investor and business-owner experience.

## 14. Academic Information

| Field | Details |
|---|---|
| Project Title | Dikaios Amanah |
| University | University of Information Technology & Sciences (UITS) |
| Department | Computer Science and Engineering |
| Course | CSE 416 — Software Project Design and Development |
| Semester | Autumn 2026 |
| Submission Date | 10 November 2026 |

### Project Supervisor

**Dr. Mahfida Amjad Dipa**  
Assistant Professor  
Department of Computer Science and Engineering  
University of Information Technology & Sciences

### Project Team

| Team Member | Student ID | Primary Contribution |
|---|---|---|
| Mehedi Hassan Bhuiyan | 0432320005101080 | Overall project development, coordination, and integration |
| Hasib Al Mahmud | 0432320005101095 | Database design and management |
| Elham Rafat Mahmud (Rashik) | 0432320005101056 | UI design and development |

## 15. License and Academic Use

Dikaios Amanah was developed as an academic project for the CSE 416 — Software Project Design and Development course at the University of Information Technology & Sciences.

No separate open-source license is currently specified for this repository.

---

<p align="center">
  <strong>Dikaios Amanah</strong>
  <br>
  Ethical Investment. Transparent Partnerships. Accountable Technology.
  <br><br>
  University of Information Technology & Sciences
  <br>
  Department of Computer Science and Engineering
</p>
````