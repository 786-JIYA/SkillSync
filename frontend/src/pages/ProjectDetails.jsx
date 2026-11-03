
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import "./ProjectDetails.css";

function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { token, student } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProject() {
            setLoading(true);
            setError("");

            try {
                const result = await projectService.getProjectById(
                    token,
                    projectId
                );

                if (active) {
                    setProject(result.data || null);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load project details.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProject();

        return () => {
            active = false;
        };
    }, [token, projectId]);

    const isCreator =
        project && student && project.creatorId === student.id;

    function formatStatus(status) {
        return status?.replaceAll("_", " ") || "Unknown";
    }

    if (loading) {
        return (
            <div className="project-details-message">
                Loading project details...
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="project-details-message">
                <h2>Project unavailable</h2>
                <p>{error || "Project not found."}</p>
                <button onClick={() => navigate("/projects")}>
                    Back to Projects
                </button>
            </div>
        );
    }

    const members = project.team?.members || [];
    const requiredSkills = project.requiredSkills || [];

    return (
        <div className="project-details-page">
            <aside className="details-sidebar">
                <div className="details-brand">
                    <span>S</span>
                    SkillSync
                </div>

                <nav className="details-nav">
                    <button onClick={() => navigate("/dashboard")}>
                        ◈ Overview
                    </button>
                    <button onClick={() => navigate("/skills")}>
                        ◇ My Skills
                    </button>
                    <button
                        className="active"
                        onClick={() => navigate("/projects")}
                    >
                        ▣ Projects
                    </button>
                </nav>

                <div className="details-sidebar-bottom">
                    <div className="details-user">
                        <div className="details-avatar">
                            {student?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                            <strong>{student?.name || "Student"}</strong>
                            <small>
                                {student?.department?.name || "Student"}
                            </small>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="details-main">
                <header className="details-topbar">
                    <span>Student Workspace / Projects / Details</span>
                    <div className="details-top-avatar">
                        {student?.name?.charAt(0) || "S"}
                    </div>
                </header>

                <section className="details-content">
                    <button
                        className="details-back"
                        onClick={() => navigate("/projects")}
                    >
                        ← Back to Projects
                    </button>

                    <div className="details-hero">
                        <div>
                            <span className={`details-status ${project.status?.toLowerCase()}`}>
                                {formatStatus(project.status)}
                            </span>

                            <h1>{project.title}</h1>

                            <p className="details-subtitle">
                                Created by {project.creator?.name || "Student"}
                            </p>
                        </div>

                        {isCreator && project.status === "OPEN" && (
                            <button
                                className="edit-project-button"
                                onClick={() => navigate("/projects")}
                            >
                                Manage Project
                            </button>
                        )}
                    </div>

                    <div className="details-layout">
                        <div className="details-left">
                            <section className="details-card">
                                <h2>About this Project</h2>
                                <p className="details-description">
                                    {project.description}
                                </p>
                            </section>

                            <section className="details-card">
                                <div className="details-section-heading">
                                    <h2>Project Skills</h2>
                                    <span>{requiredSkills.length} skills</span>
                                </div>

                                {requiredSkills.length === 0 ? (
                                    <p className="details-muted">
                                        No skills specified.
                                    </p>
                                ) : (
                                    <div className="details-skills-list">
                                        {requiredSkills.map((item) => (
                                            <div
                                                className="details-skill-item"
                                                key={item.skillId || item.skill?.id}
                                            >
                                                <div>
                                                    <strong>
                                                        {item.skill?.name || "Skill"}
                                                    </strong>
                                                    <small>
                                                        {item.skill?.category || "General"}
                                                    </small>
                                                </div>

                                                <span className={
                                                    item.importance === "REQUIRED"
                                                        ? "required-label"
                                                        : "optional-label"
                                                }>
                                                    {item.importance === "REQUIRED"
                                                        ? "Required"
                                                        : "Nice to have"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <div className="details-right">
                            <section className="details-card project-info-card">
                                <h2>Project Information</h2>

                                <div className="info-row">
                                    <span>Status</span>
                                    <strong>{formatStatus(project.status)}</strong>
                                </div>

                                <div className="info-row">
                                    <span>Preferred Team Size</span>
                                    <strong>{project.preferredTeamSize} students</strong>
                                </div>

                                <div className="info-row">
                                    <span>Current Team Members</span>
                                    <strong>{project.team?._count?.members ?? members.length}</strong>
                                </div>

                                <div className="info-row">
                                    <span>Department</span>
                                    <strong>
                                        {project.creator?.department?.name || "Not specified"}
                                    </strong>
                                </div>
                            </section>

                            <section className="details-card creator-card">
                                <h2>Project Creator</h2>

                                <div className="creator-profile">
                                    <div className="creator-profile-avatar">
                                        {project.creator?.name?.charAt(0) || "S"}
                                    </div>

                                    <div>
                                        <strong>
                                            {project.creator?.name || "Student"}
                                        </strong>
                                        <small>
                                            {project.creator?.department?.name || "Student"}
                                        </small>
                                    </div>
                                </div>
                            </section>

                            <section className="details-card">
                                <h2>Team Members</h2>

                                {members.length === 0 ? (
                                    <p className="details-muted">
                                        No team members found.
                                    </p>
                                ) : (
                                    members.map((member) => (
                                        <div
                                            className="team-member"
                                            key={member.studentId || member.student?.id}
                                        >
                                            <div className="team-member-avatar">
                                                {member.student?.name?.charAt(0) || "S"}
                                            </div>

                                            <div>
                                                <strong>
                                                    {member.student?.name || "Student"}
                                                </strong>
                                                <small>{member.role}</small>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </section>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ProjectDetails;
