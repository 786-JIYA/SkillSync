
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { skillService } from "../services/skillService";
import "./CreateProject.css";

function CreateProject() {
    const navigate = useNavigate();
    const { token, student } = useAuth();

    const [skills, setSkills] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [preferredTeamSize, setPreferredTeamSize] = useState(2);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const [loadingSkills, setLoadingSkills] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadSkills() {
            try {
                const result = await skillService.getAllSkills(token);
                setSkills(result.data?.skills || []);
            } catch (err) {
                setError(err.message || "Unable to load available skills.");
            } finally {
                setLoadingSkills(false);
            }
        }

        loadSkills();
    }, [token]);

    function handleSkillToggle(skillId) {
        setSelectedSkills((current) => {
            const exists = current.some((item) => item.skillId === skillId);

            if (exists) {
                return current.filter((item) => item.skillId !== skillId);
            }

            return [
                ...current,
                {
                    skillId,
                    importance: "REQUIRED",
                },
            ];
        });
    }

    function handleImportanceChange(skillId, importance) {
        setSelectedSkills((current) =>
            current.map((item) =>
                item.skillId === skillId
                    ? { ...item, importance }
                    : item
            )
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (title.trim().length < 3) {
            setError("Project title must contain at least 3 characters.");
            return;
        }

        if (description.trim().length < 10) {
            setError("Description must contain at least 10 characters.");
            return;
        }

        if (Number(preferredTeamSize) < 2) {
            setError("Preferred team size must be at least 2.");
            return;
        }

        if (selectedSkills.length === 0) {
            setError("Please select at least one skill.");
            return;
        }

        if (!selectedSkills.some((skill) => skill.importance === "REQUIRED")) {
            setError("Please select at least one REQUIRED skill.");
            return;
        }

        const projectData = {
            title: title.trim(),
            description: description.trim(),
            preferredTeamSize: Number(preferredTeamSize),
            requiredSkills: selectedSkills,
        };

        try {
            setSubmitting(true);

            const result = await projectService.createProject(
                token,
                projectData
            );

            const teamId = result.data?.project?.team?.id;



            if (teamId) {
                navigate(`/teams/${teamId}/invitations`);
            } else {
                navigate("/projects");
            }
        } catch (err) {
            setError(err.message || "Unable to create project.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="create-project-page">
            <aside className="create-sidebar">
                <div className="create-brand">
                    <span className="create-brand-icon">S</span>
                    SkillSync
                </div>

                <nav className="create-nav">
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

                <div className="create-sidebar-bottom">
                    <div className="create-student">
                        <div className="create-avatar">
                            {student?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                            <strong>{student?.name || "Student"}</strong>
                            <small>
                                {student?.department?.name || "Student"}
                            </small>
                        </div>
                    </div>

                    <button
                        className="create-back-button"
                        onClick={() => navigate("/projects")}
                    >
                        ← Back to Projects
                    </button>
                </div>
            </aside>

            <main className="create-main">
                <header className="create-topbar">
                    <span>Student Workspace / Projects / Create</span>
                    <div className="create-top-avatar">
                        {student?.name?.charAt(0) || "S"}
                    </div>
                </header>

                <section className="create-content">
                    <button
                        className="create-back-link"
                        onClick={() => navigate("/projects")}
                    >
                        ← Back to Projects
                    </button>

                    <div className="create-heading">
                        <p className="create-eyebrow">BUILD SOMETHING TOGETHER</p>
                        <h1>Create a New Project</h1>
                        <p>
                            Share your idea, define the skills you need,
                            and find students to collaborate with.
                        </p>
                    </div>

                    <form className="create-form" onSubmit={handleSubmit}>
                        <div className="create-form-section">
                            <div className="section-heading">
                                <span className="section-number">01</span>
                                <div>
                                    <h2>Project Information</h2>
                                    <p>Tell other students about your idea.</p>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="project-title">
                                    Project Title <span>*</span>
                                </label>
                                <input
                                    id="project-title"
                                    type="text"
                                    placeholder="e.g. Campus Event Management System"
                                    value={title}
                                    maxLength={120}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <small>{title.length}/120 characters</small>
                            </div>

                            <div className="form-field">
                                <label htmlFor="project-description">
                                    Project Description <span>*</span>
                                </label>
                                <textarea
                                    id="project-description"
                                    placeholder="Describe your project idea, its purpose, and what you want to build..."
                                    value={description}
                                    maxLength={2000}
                                    rows={5}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                                <small>{description.length}/2000 characters</small>
                            </div>

                            <div className="form-field team-size-field">
                                <label htmlFor="team-size">
                                    Preferred Team Size <span>*</span>
                                </label>
                                <p>How many students would you like in your team?</p>
                                <input
                                    id="team-size"
                                    type="number"
                                    min="2"
                                    value={preferredTeamSize}
                                    onChange={(e) =>
                                        setPreferredTeamSize(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="create-form-section">
                            <div className="section-heading">
                                <span className="section-number">02</span>
                                <div>
                                    <h2>Required Skills</h2>
                                    <p>
                                        Select the skills needed to complete
                                        your project.
                                    </p>
                                </div>
                            </div>

                            <div className="skill-selection-info">
                                <strong>Select your skills</strong>
                                <span>
                                    {selectedSkills.length} selected
                                </span>
                            </div>

                            {loadingSkills ? (
                                <p className="skill-loading">
                                    Loading available skills...
                                </p>
                            ) : skills.length === 0 ? (
                                <p className="skill-loading">
                                    No skills are currently available.
                                </p>
                            ) : (
                                <div className="available-skills">
                                    {skills.map((skill) => {
                                        const selected = selectedSkills.find(
                                            (item) => item.skillId === skill.id
                                        );

                                        return (
                                            <div
                                                className={`available-skill ${selected ? "selected" : ""}`}
                                                key={skill.id}
                                            >
                                                <label className="skill-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(selected)}
                                                        onChange={() =>
                                                            handleSkillToggle(skill.id)
                                                        }
                                                    />
                                                    <span>{skill.name}</span>
                                                </label>

                                                {selected && (
                                                    <select
                                                        value={selected.importance}
                                                        onChange={(e) =>
                                                            handleImportanceChange(
                                                                skill.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        aria-label={`${skill.name} importance`}
                                                    >
                                                        <option value="REQUIRED">
                                                            Required
                                                        </option>
                                                        <option value="NICE_TO_HAVE">
                                                            Nice to have
                                                        </option>
                                                    </select>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="skill-legend">
                                <span>
                                    <b className="required-dot"></b>
                                    Required: Essential for the project
                                </span>
                                <span>
                                    <b className="optional-dot"></b>
                                    Nice to have: Additional advantage
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="create-error">
                                {error}
                            </div>
                        )}

                        <div className="create-form-actions">
                            <button
                                type="button"
                                className="cancel-project-button"
                                onClick={() => navigate("/projects")}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="submit-project-button"
                                disabled={submitting || loadingSkills}
                            >
                                {submitting
                                    ? "Creating Project..."
                                    : "Create Project →"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default CreateProject;
