# SkillSync V2 — Feature Roadmap

**Project:** SkillSync  
**Version:** V2  
**Status:** Planned  
**Purpose:** Extend SkillSync into a student networking, project management, and team collaboration platform.

---

## 1. Overview

SkillSync helps students discover collaborators, showcase their skills, create projects, and form teams.

V2 will extend the existing platform with:

1. Complete Student Profile
2. My Projects — Project Management
3. Browse Students — Student Discovery
4. Extended Email Notification System

The objective is to make it easier for students to discover suitable teammates and manage their project collaboration journey.

## 2. Complete My Profile

### Objective

Allow students to maintain a professional profile that other students and project creators can explore before inviting them to a team.

### Profile Information

| Field | Description |
|---|---|
| Name | Student's name |
| PRN | College registration number |
| Department | Student's department |
| Class Year | Current academic year |
| Bio | Short introduction |
| Skills | Technical and non-technical skills |
| LinkedIn URL | LinkedIn profile link |
| GitHub URL | GitHub profile link |
| Profile Picture | Optional profile image |

### Functional Requirements

- Students can view their own profile.
- Students can update editable profile information.
- Students can add and remove skills.
- Students can add or update LinkedIn and GitHub links.
- Profile URLs must be validated.
- Students should be able to view their profile as other users see it.
- Sensitive account information, such as password hashes, must never be exposed.

### Expected Outcome

Every student has a professional profile that communicates their skills, interests, and development experience.

## 3. My Projects — Project Management

### Objective

Create a separate page where students can manage projects they have created.

This page must remain separate from the existing Browse Projects page.

### Functional Requirements

**Project Management**
- View projects created by the logged-in student.
- Add a new project.
- Edit project information.
- Delete a project, subject to project-state and team-membership rules.
- View project details and team members.

**Team Management**
- View students who are part of a project team.
- View pending join requests.
- Accept or reject join requests.
- Invite students to a project team.
- Discover and invite recommended students.

### Expected Outcome

Students can manage their published projects and team-building activities from one dedicated location.

## 4. Browse Students — Student Discovery

### Objective

Introduce a dedicated student discovery page where users can search for potential collaborators.

This is a new feature and must remain separate from Browse Projects.

### Search Functionality

Students should be discoverable using:

- Student name.
- Skills.
- Department.
- Class year.

Search should support finding students using relevant profile information.

### Student Profile Preview

Users should be able to explore:

- Name.
- Bio.
- Department.
- Class year.
- Skills.
- Projects.
- LinkedIn profile.
- GitHub profile.

### Student Profile Details

Users should be able to open a student's detailed profile to understand their experience and interests.

### Invite Student Functionality

A project creator should be able to:

1. Open Browse Students.
2. Search for a suitable student.
3. View the student's profile.
4. Select Invite to Project.
5. Choose one of their own projects.
6. Send an invitation.

The existing invitation backend service and API should be reused.

### Expected Outcome

Students can discover collaborators based on their skills and interests instead of relying only on existing connections.

## 5. Extended Email Notification System

### Objective

Provide email notifications for important team collaboration activities.

The existing Nodemailer and Gmail SMTP integration will be reused.

### Notification Requirements

| Activity | Recipient | Required Information |
|---|---|---|
| Team invitation sent | Invited student | Project/team invitation details |
| Join request submitted | Project creator | Student details and request message |
| Join request accepted | Requesting student | Acceptance confirmation |
| Join request rejected | Requesting student | Rejection notification |
| Invitation accepted | Project creator | Student acceptance confirmation |
| Invitation rejected | Project creator | Student rejection notification |

### Existing Implementation

The following functionality is already implemented:

- Nodemailer dependency.
- Gmail SMTP configuration.
- Reusable email service.
- SMTP connection verification.
- Test email delivery.
- Email notification when a project creator sends a team invitation.

### Remaining Implementation

- Join request submission email.
- Join request acceptance email.
- Join request rejection email.
- Invitation acceptance email.
- Invitation rejection email.

### Important Technical Requirements

- Database operations must not be rolled back merely because email delivery fails.
- Email sending should happen after successful database operations.
- Email credentials must remain in environment variables.
- `.env` must never be committed.
- Email templates should be reusable and maintainable.
- Avoid sending duplicate notifications for the same event.

## 6. Application Navigation Changes

The application should provide separate navigation entries for:

| Page | Purpose |
|---|---|
| Dashboard | Student overview |
| Browse Projects | Discover available projects |
| My Projects | Manage created projects |
| Browse Students | Discover potential collaborators |
| My Profile | View and update personal profile |
| My Invitations | Manage received invitations |
| My Skills | Manage student skills |

Existing navigation and routes should be reviewed before adding new entries.

## 7. Proposed Development Phases

### Phase 1 — Profile Management
- Review existing Student and skill models.
- Add LinkedIn and GitHub profile fields.
- Implement profile update functionality.
- Implement profile viewing functionality.
- Build Complete My Profile frontend.

### Phase 2 — Browse Students
- Implement student search.
- Add department and class-year filters.
- Support skill-based discovery.
- Implement student profile details.
- Add Invite to Project functionality.

### Phase 3 — My Projects
- Implement project listing for the creator.
- Add project creation and editing.
- Implement safe project deletion.
- Add team management.
- Integrate student invitations.

### Phase 4 — Email Notifications
- Implement join request notifications.
- Implement join request response notifications.
- Implement invitation response notifications.
- Test email failure handling.

### Phase 5 — Integration and Testing
- Test complete profile workflows.
- Test student discovery and search.
- Test project management.
- Test invitation flows from both entry points.
- Test join request workflows.
- Test email delivery and failure scenarios.
- Perform regression testing on existing V1 features.

## 8. Important Architectural Decisions

1. Browse Projects and My Projects must remain separate features.
2. Browse Students must be a separate discovery page.
3. Invitations from My Projects and Browse Students must use the same backend invitation service.
4. Students should only manage projects they are authorized to manage.
5. Profile information must be validated before saving.
6. Public profile responses must exclude sensitive account information.
7. Email notifications must not compromise successful database transactions.
8. Existing V1 functionality must remain compatible.

## 9. Out of Scope for This Roadmap

Unless separately approved, the following are not included:

- Real-time chat.
- Video calling.
- Payment functionality.
- Automated AI-based student ranking.
- External LinkedIn or GitHub account authentication.
- A separate notification microservice.

These can be evaluated independently in future versions.

## 10. Definition of Done

V2 will be considered complete when:

- Students can maintain their professional profiles.
- Students can discover other students.
- Students can view detailed student profiles.
- Project creators can invite students from multiple application pages.
- Students can manage their own projects.
- Join request and invitation events generate the required emails.
- Existing V1 workflows continue working.
- Backend authorization and validation are tested.
- Documentation is updated.
- Changes are reviewed and merged through GitHub pull requests.

---

**SkillSync V2 Goal:** Build a platform where students can showcase their abilities, discover like-minded collaborators, and turn project ideas into teams.