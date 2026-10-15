# SkillSync Backend

SkillSync is a student team-formation platform that aims to help students discover suitable teammates based on their skills, project requirements, and team needs.

This repository contains the backend application for SkillSync.

## Tech Stack

- **Runtime:** Node.js
- **Language:** JavaScript (CommonJS)
- **Backend Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **PostgreSQL Driver:** `pg`
- **Prisma Adapter:** `@prisma/adapter-pg`

## Features

- Express server setup
- PostgreSQL database connectivity
- Prisma ORM integration
- Database schema and migrations
- API health-check endpoint
- Foundation for future student, project, and team-formation APIs

> Team matching and other business features will be added as development progresses.

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the cloned repository directory:

```bash
cd YOUR_REPOSITORY_FOLDER
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual GitHub HTTPS URL and `YOUR_REPOSITORY_FOLDER` with the cloned folder name.

### 2. Install dependencies

```bash
npm install
```

### 3. Create the PostgreSQL database

Start PostgreSQL and create a database named:

```text
skillsync
```

Each team member should use their own local PostgreSQL database and credentials.

### 4. Configure environment variables

Create a local `.env` file from the example:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

Open `.env` and update the database connection string with your local PostgreSQL username and password.

Example:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/skillsync?schema=public"
PORT=5000
```

Replace `YOUR_PASSWORD` with your own PostgreSQL password.

**Important:** Never commit your actual `.env` file, database password, or other secrets to GitHub.

### 5. Apply database migrations

Run:

```bash
npx prisma migrate deploy
```

This applies the migrations committed in the `prisma/migrations` directory to your configured database.

### 6. Generate Prisma Client

Run:

```bash
npx prisma generate
```

### 7. Start the development server

```bash
npm run dev
```

To start the server without development mode:

```bash
npm start
```

By default, the server uses port `5000`, unless overridden by the `PORT` environment variable.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server with Nodemon |
| `npm start` | Start the server |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate deploy` | Apply committed database migrations |
| `node test-db.js` | Test database connectivity |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Returns a welcome message |
| `GET` | `/api/health` | Checks whether the backend is running |

Example health-check response:

```json
{
  "success": true,
  "message": "SkillSync backend is running"
}
```

You can test the health endpoint in your browser or API client at:

```text
http://localhost:5000/api/health
```

## Database Connection Test

To test the database connection, run:

```bash
node test-db.js
```

The script connects to PostgreSQL and checks the number of student records.

A successful connection should display a confirmation message and the student count.

## Project Structure

```text
backend/
├── prisma/
│   ├── migrations/
│   │   ├── 20261015094249_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── server.js
│   └── lib/
│       └── prisma.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── prisma7.config.ts
├── skills-lock.json
├── test-db.js
└── README.md
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/skillsync?schema=public` |
| `PORT` | Backend server port | `5000` |

Use your own local database credentials. The values above are examples only.

## Database and Migration Guidelines

- Update `prisma/schema.prisma` when the database structure needs to change.
- Create migrations during development using the appropriate Prisma migration command.
- Commit migration files so the entire team can maintain a consistent database structure.
- Use `npx prisma migrate deploy` to apply committed migrations to a new local database.
- Never delete or modify an already-shared migration without coordinating with the team.
- Do not commit database credentials or production data.

## Git Workflow

Before starting work, update your local branch:

```bash
git pull
```

After making and testing changes:

```bash
git add .
git commit -m "describe your changes"
git push
```

Use meaningful commit messages and coordinate shared changes with the team.

## Security Guidelines

- Keep `.env` out of version control.
- Use `.env.example` to document required environment variables without exposing secrets.
- Never publish database passwords, access tokens, or private credentials.
- Validate incoming API data as application endpoints are implemented.
- Apply appropriate authentication and authorization when protected endpoints are introduced.

## Current Development Status

The initial backend foundation includes:

- Express application and server setup
- PostgreSQL database connection
- Prisma integration
- Initial database schema and migration
- Basic welcome and health-check endpoints
- Database connection test

Additional API endpoints, student and project workflows, and matching functionality will be developed in subsequent stages.

## Contribution

Team members should coordinate before making changes to shared schema, migrations, or application configuration.

Please test your changes locally and follow the agreed Git workflow before pushing to the repository.

---

**SkillSync Backend — Built collaboratively by the SkillSync team.**
