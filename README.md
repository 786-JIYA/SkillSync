# SkillSync

**A Skill-Based Student Project Matching and Team Formation Platform**

SkillSync is a web application designed to help students discover projects that match their skills, identify skill gaps, and form balanced teams for collaborative development.

## Features

- **Authentication:** Student registration, login, and authenticated access.
- **Student Profiles:** Manage student profiles and skills.
- **Project Management:** Create projects and define required skills.
- **Skill Matching:** Discover suitable projects based on skill overlap and identify missing skills.
- **Team Formation:** Organize team members and track team skill coverage.
- **Invitations:** Invite students to join teams.
- **Join Requests:** Allow students to request membership in teams.
- **Skill Coverage:** Evaluate how well a team covers a project's required skills.

> Note: Features are part of the planned API scope. Refer to the implemented code for current availability.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication

## Project Structure

```text
SkillSync/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── lib/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/786-JIYA/SkillSync.git
cd SkillSync
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a local `.env` file using `.env.example` as a reference. Configure the PostgreSQL connection string and any other environment variables required by the backend.

Run the database migrations and Prisma generation using the commands documented in `backend/README.md` and `backend/package.json`.

Start the backend using the development script defined in `backend/package.json`.

### 3. Set Up the Frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## API Documentation

The backend API is organized under the `/api/v1` prefix.

The planned API modules include:

- Authentication
- Student Profiles and Skills
- Projects
- Teams
- Matching
- Invitations
- Join Requests

Refer to the backend documentation and implemented routes for endpoint details.

## Team Collaboration Guidelines

1. Pull the latest changes before starting work.
2. Create a separate feature branch for each task.
3. Keep changes focused on your assigned module.
4. Never commit `.env` files, credentials, or `node_modules`.
5. Test your changes before opening a pull request.
6. Open a pull request to `main` and request a review before merging.
7. Coordinate API contract changes with the team before implementation.

## Development Status

SkillSync is under active development. The available functionality depends on the current implementation of the frontend, backend, and API modules.

## License

No license has been specified yet.