# SkillSync – Student Skill & Team Collaboration Platform

<p align="center">
  <strong>Discover Skills. Build Teams. Create Projects. Grow Together.</strong>
</p>

SkillSync is a student-focused platform that helps students showcase their technical skills, discover project opportunities, connect with like-minded students, and build teams for collaborative projects.

The platform aims to make it easier for students to find teammates based on their skills and interests while encouraging peer learning and practical project development.

---

## Project Status

**Version:** V1.0.0  
**Status:** V1 Completed  
**Development:** V2 – Upcoming

The core V1 features have been implemented and tested locally.

---

## Features – V1

### 1. Student Authentication
- Student registration and login.
- JWT-based authentication.
- Protected application routes.

### 2. Student Dashboard
- Personalized dashboard.
- Student information and activity overview.
- Navigation to platform features.

### 3. Student Profile
- View student profile and academic information.
- Access profile-related details.

### 4. Project Management
- Create projects.
- Browse available projects.
- View detailed project information.
- Define required project skills.
- View project creators and associated teams.

### 5. Team Management
- Create and manage project teams.
- View team members.
- Support team creator and member roles.
- Leave a team.

### 6. Team Invitations
- Send invitations to students.
- View received invitations.
- Accept or reject invitations.
- Track invitation statuses.

### 7. Join Request Management
- Request to join project teams.
- View sent join requests.
- Cancel pending requests.
- Team creators can view incoming requests.
- Accept or reject join requests.

### 8. Skill-Based Matching
- Individual project-skill matching.
- Team skill coverage calculation.
- Team improvement score.
- Combined matching score.
- Recommended projects based on skill compatibility.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| API Architecture | REST API |

---

## Project Structure

```text
SkillSync/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── matching/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## Getting Started – Run Locally

Follow these instructions to clone and run SkillSync on your local machine.

### Prerequisites

Make sure you have installed:

- Node.js (LTS recommended).
- npm.
- PostgreSQL.
- Git.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd SkillSync
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory using the environment variables required by the backend configuration.

At minimum, configure your PostgreSQL connection and authentication secret. Refer to the backend configuration and any provided `.env.example` file.

Example configuration:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/skillsync"
JWT_SECRET="your_secure_secret"
PORT=5000
```

Create a PostgreSQL database named `skillsync` or use your own database name and update the connection URL.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Start the backend using the development script defined in `backend/package.json`:

```bash
npm run dev
```

The backend API is expected to run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd SkillSync/frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend using the development script defined in `frontend/package.json`:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal. Open that URL in your browser.

### 4. Explore SkillSync

Once both servers are running:

1. Register as a student.
2. Log in to your account.
3. Explore the dashboard.
4. Browse available projects.
5. Create your own project.
6. Explore project details and required skills.
7. Create and manage teams.
8. Send and receive team invitations.
9. Send and manage join requests.
10. Explore skill-based project matching.

**Note:** You need a running PostgreSQL database and valid environment configuration. Registration and login require the backend to be running.

---

## How to Contribute

Contributions are welcome! If you're interested in improving SkillSync, fixing bugs, or adding useful features, feel free to contribute.

### Contribution Guidelines

**Step 1: Fork the Repository**

Fork this repository to your GitHub account.

**Step 2: Clone Your Fork**

```bash
git clone <YOUR_FORKED_REPOSITORY_URL>
cd SkillSync
```

**Step 3: Create a New Branch**

Create a separate branch for your contribution.

```bash
git checkout -b feature/your-feature-name
```

For bug fixes:

```bash
git checkout -b fix/your-bug-fix
```

**Step 4: Make Your Changes**

- Follow the existing project structure.
- Keep your code readable and maintainable.
- Avoid unrelated changes.
- Test your changes before submitting.

**Step 5: Commit Your Changes**

```bash
git add .
git commit -m "feat: describe your contribution"
```

**Step 6: Push Your Branch**

```bash
git push origin feature/your-feature-name
```

**Step 7: Create a Pull Request**

- Open the original SkillSync repository.
- Create a Pull Request from your fork.
- Clearly explain the changes.
- Mention any related issues.
- Provide testing details where applicable.

Please wait for review before considering your contribution merged.

---

## Roadmap – V2 (Upcoming)

V1 establishes the foundation of SkillSync. The following features are planned for future development.

### 1. Email Notification System
- Nodemailer integration.
- Automated emails for team invitations.
- Email notifications when join requests are accepted or rejected.
- Important account and platform notifications.

### 2. Enhanced Team Collaboration
- Improved team coordination.
- Additional collaboration workflows.
- Better team activity tracking.

### 3. Improved Matching System
- Further improvements to skill-based recommendations.
- More refined project and team compatibility.

### 4. User Experience Improvements
- UI and UX enhancements.
- Better feedback and notification handling.
- Additional usability improvements based on student feedback.

*V2 features are planned and are not part of the completed V1 release.*

---

## V1 Release

**SkillSync V1.0.0 – Completed!**

The first version delivers the core student authentication, project management, team management, invitation, join request, and skill-based matching workflows.

V1 development is frozen while future enhancements are planned separately for V2.

---

## Let's Connect and Collaborate

SkillSync is built with the goal of helping students learn, connect, and build meaningful projects together.

Contributions, suggestions, and feedback are welcome!

**Discover your skills. Find your team. Build something meaningful.**

