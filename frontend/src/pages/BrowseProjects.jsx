
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { skillService } from "../services/skillService";
import { matchingService } from "../services/matchingService";
import "./BrowseProjects.css";

function BrowseProjects() {
    const navigate = useNavigate();
    const { token, student, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("OPEN");
    const [skillId, setSkillId] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [recommendations, setRecommendations] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState("");

    useEffect(() => {
        async function loadSkills() {
            try {
                const result = await skillService.getAllSkills(token);
                setSkills(result.data?.skills || []);
            } catch (err) {
                console.error("Failed to load skills:", err);
            }
        }

        loadSkills();
    }, [token]);

    useEffect(() => {
        let active = true;

        async function loadProjects() {
            setLoading(true);
            setError("");

            try {
                const params = {
                    page,
                    limit: 9,
                };

                if (search.trim()) params.search = search.trim();
                if (status !== "ALL") params.status = status;
                if (skillId) params.skillId = skillId;

                const result = await projectService.getAllProjects(token, params);

                if (active) {
                    setProjects(result.data?.projects || []);
                    setTotalPages(
                        result.data?.pagination?.totalPages || 1
                    );
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load projects.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProjects();

        return () => {
            active = false;
        };
    }, [token, page, search, status, skillId, refreshKey]);

    useEffect(() => {
        let active = true;

        const loadRecommendations = async () => {
            try {
                setRecommendationsLoading(true);
                setRecommendationsError("");

                const result = await matchingService.getRecommendedProjects(
                    token,
                    { page: 1, limit: 3 }
                );

                if (active) {
                    setRecommendations(result.data || []);
                }
            } catch (err) {
                if (active) {
                    setRecommendationsError(err.message);
                }
            } finally {
                if (active) {
                    setRecommendationsLoading(false);
                }
            }
        };

        if (token) {
            loadRecommendations();
        }

        return () => {
            active = false;
        };
    }, [token]);

    function handleFilterChange(callback, value) {
        callback(value);
        setPage(1);
    }

    return (
        <div className="browse-page">
            <aside className="browse-sidebar">
                <div className="browse-brand">
                    <span className="brand-symbol">S</span>
                    <span>SkillSync</span>
                </div>

                <nav className="browse-nav">
                    <button onClick={() => navigate("/dashboard")}>
                        ◈ Overview
                    </button>
                    <button onClick={() => navigate("/skills")}>
                        ◇ My Skills
                    </button>
                    <button className="active">
                        ▣ Projects
                    </button>
                </nav>

                <div className="browse-sidebar-bottom">
                    <div className="sidebar-student">
                        <div className="student-avatar">
                            {student?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                            <strong>{student?.name || "Student"}</strong>
                            <small>{student?.department?.name || "Student"}</small>
                        </div>
                    </div>

                    <button
                        className="browse-logout"
                        onClick={logout}
                    >
                        ↪ Logout
                    </button>
                </div>
            </aside>

            <main className="browse-main">
                <header className="browse-topbar">
                    <span>Student Workspace / Projects</span>
                    <div className="topbar-avatar">
                        {student?.name?.charAt(0) || "S"}
                    </div>
                </header>

                <section className="browse-content">
                    <div className="browse-heading">
                        <div>
                            <p className="browse-eyebrow">COLLABORATE & BUILD</p>
                            <h1>Discover Projects</h1>
                            <p>
                                Find projects that match your skills and collaborate
                                with other students.
                            </p>
                        </div>

                        <button
                            className="create-project-btn"
                            onClick={() => navigate("/projects/create")}
                        >
                            + Create Project
                        </button>
                    </div>

                    <div className="browse-filters">
                        <input
                            type="search"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) =>
                                handleFilterChange(setSearch, e.target.value)
                            }
                        />

                        <select
                            value={status}
                            onChange={(e) =>
                                handleFilterChange(setStatus, e.target.value)
                            }
                        >
                            <option value="OPEN">Open Projects</option>
                            <option value="ALL">All Projects</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        <select
                            value={skillId}
                            onChange={(e) =>
                                handleFilterChange(setSkillId, e.target.value)
                            }
                        >
                            <option value="">All Skills</option>
                            {skills.map((skill) => (
                                <option key={skill.id} value={skill.id}>
                                    {skill.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Recommended Projects */}
                    <section className="recommended-section">
                        <div className="recommended-heading">
                            <div>
                                <h2>Recommended for You</h2>
                                <p>Projects matched with your skills</p>
                            </div>
                            <span className="recommended-badge">AI MATCHING</span>
                        </div>

                        {recommendationsLoading ? (
                            <div className="recommended-loading">
                                Finding projects that match your skills...
                            </div>
                        ) : recommendationsError ? (
                            <div className="recommended-error">
                                {recommendationsError}
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="recommended-empty">
                                No recommendations available yet. Add more skills to your
                                profile to improve your matches.
                            </div>
                        ) : (
                            <div className="recommended-grid">
                                {recommendations.map((item) => (
                                    <article
                                        className="recommended-card"
                                        key={item.project.id}
                                    >
                                        <span className="recommended-score">
                                            {Math.round(item.individualMatchScore)}% Match
                                        </span>

                                        <h3>{item.project.title}</h3>

                                        <strong>Matched Skills</strong>
                                        <div className="recommended-skills">
                                            {item.matchedSkills?.length > 0 ? (
                                                item.matchedSkills.map((skill) => (
                                                    <span key={skill.skillId}>
                                                        {skill.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>No matched skills</span>
                                            )}
                                        </div>

                                        {item.missingSkills?.length > 0 && (
                                            <>
                                                <strong>Skills to Improve</strong>
                                                <div className="recommended-skills">
                                                    {item.missingSkills.map((skill) => (
                                                        <span key={skill.skillId}>
                                                            {skill.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {item.explanation?.length > 0 && (
                                            <p className="recommended-explanation">
                                                {item.explanation[0]}
                                            </p>
                                        )}

                                        <button
                                            onClick={() =>
                                                navigate(`/projects/${item.project.id}`)
                                            }
                                        >
                                            View Project
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {loading && (
                        <div className="browse-message">
                            Loading projects...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="browse-error">
                            <p>{error}</p>
                            <button onClick={() => setRefreshKey((key) => key + 1)}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && projects.length === 0 && (
                        <div className="browse-empty">
                            <div>▣</div>
                            <h3>No projects found</h3>
                            <p>Try changing your filters or create a new project.</p>
                            <button
                                onClick={() => navigate("/projects/create")}
                            >
                                Create Your First Project
                            </button>
                        </div>
                    )}

                    {!loading && !error && projects.length > 0 && (
                        <>
                            <div className="browse-results-heading">
                                <h2>Available Projects</h2>
                                <span>{projects.length} projects shown</span>
                            </div>

                            <div className="browse-project-grid">
                                {projects.map((project) => (
                                    <article
                                        className="browse-project-card"
                                        key={project.id}
                                    >
                                        <div className="project-card-top">
                                            <span className={`project-status ${project.status?.toLowerCase()}`}>
                                                {project.status?.replace("_", " ")}
                                            </span>
                                            <span className="project-team-size">
                                                ◉ {project.preferredTeamSize} members
                                            </span>
                                        </div>

                                        <h3>{project.title}</h3>

                                        <p className="project-description">
                                            {project.description}
                                        </p>

                                        <div className="project-skills">
                                            {project.requiredSkills?.map((item) => (
                                                <span key={item.skillId || item.skill?.id}>
                                                    {item.skill?.name || "Skill"}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="project-card-footer">
                                            <div className="project-creator">
                                                <div className="creator-avatar">
                                                    {project.creator?.name?.charAt(0) || "S"}
                                                </div>
                                                <span>
                                                    {project.creator?.name || "Student"}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    navigate(`/projects/${project.id}`)
                                                }
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="browse-pagination">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Previous
                                </button>

                                <span>Page {page} of {totalPages}</span>

                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default BrowseProjects;
