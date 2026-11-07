
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const { student, logout } = useAuth();
    const navigate = useNavigate();

    const department =
        typeof student?.department === "object"
            ? student?.department?.name
            : student?.department;

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    const firstName = student?.name?.split(" ")[0] || "Student";
    const avatarLetter = firstName.charAt(0).toUpperCase();

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">S</div>
                    <span>SkillSync</span>
                </div>

                <p className="sidebar-label">MENU</p>

                <nav className="sidebar-nav">
                    <button
                        className="nav-item active"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span>⌂</span> Overview
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/profile")}
                    >
                        <span>◉</span> My Profile
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/skills")}
                    >
                        <span>✦</span> My Skills
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/projects")}
                    >
                        <span>▣</span> Browse Projects
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/my-activity")}
                    >
                        <span>✉</span> My Activity
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">{avatarLetter}</div>

                        <div className="user-info">
                            <strong>{student?.name || "Student"}</strong>
                            <span>{department || "Student"}</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        ↪ Logout
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="topbar">
                    <div>
                        <p className="breadcrumb">Pages / Overview</p>
                        <h2>Dashboard</h2>
                    </div>

                    <div
                        className="topbar-profile"
                        onClick={() => navigate("/profile")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") navigate("/profile");
                        }}
                    >
                        <div className="user-avatar">{avatarLetter}</div>
                        <span>{student?.name || "Student"}</span>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="welcome-banner">
                        <div>
                            <p className="welcome-tag">YOUR LEARNING SPACE</p>
                            <h1>Welcome back, {firstName}! 👋</h1>

                            <p>
                                Build your skills, discover projects, and
                                connect your learning with real opportunities.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() => navigate("/skills")}
                            >
                                Explore My Skills <span>→</span>
                            </button>
                        </div>

                        <div className="welcome-decoration">✦</div>
                    </div>

                    <div className="section-heading">
                        <div>
                            <h2>Your Workspace</h2>
                            <p>Quick access to your SkillSync activities.</p>
                        </div>
                    </div>

                    <div className="overview-grid">
                        <button
                            className="overview-card"
                            onClick={() => navigate("/skills")}
                        >
                            <div className="overview-icon skills-icon">✦</div>
                            <div>
                                <h3>My Skills</h3>
                                <p>Manage your technical and soft skills.</p>
                            </div>
                            <span className="card-arrow">→</span>
                        </button>

                        <button
                            className="overview-card"
                            onClick={() => navigate("/projects")}
                        >
                            <div className="overview-icon projects-icon">▣</div>
                            <div>
                                <h3>Browse Projects</h3>
                                <p>
                                    Discover projects, explore required skills,
                                    and find collaboration opportunities.
                                </p>
                            </div>
                            <span className="card-arrow">→</span>
                        </button>

                        <button
                            className="overview-card"
                            onClick={() => navigate("/profile")}
                        >
                            <div className="overview-icon profile-icon">◉</div>
                            <div>
                                <h3>My Profile</h3>
                                <p>View your academic and personal details.</p>
                            </div>
                            <span className="card-arrow">→</span>
                        </button>

                        <button
                            className="overview-card"
                            onClick={() => navigate("/my-activity")}
                        >
                            <div className="overview-icon profile-icon">✉</div>
                            <div>
                                <h3>My Activity</h3>
                                <p>
                                    Track received invitations and your join
                                    requests.
                                </p>
                            </div>
                            <span className="card-arrow">→</span>
                        </button>

                        <button
                            className="overview-card"
                            onClick={() => navigate("/projects/create")}
                        >
                            <div className="overview-icon projects-icon">+</div>
                            <div>
                                <h3>Create Project</h3>
                                <p>Share your idea and build a project team.</p>
                            </div>
                            <span className="card-arrow">→</span>
                        </button>
                    </div>

                    <div className="section-heading profile-heading">
                        <div>
                            <h2>Student Information</h2>
                            <p>Your registered account details.</p>
                        </div>
                        <button
                            className="profile-view-button"
                            onClick={() => navigate("/profile")}
                        >
                            View Profile →
                        </button>
                    </div>

                    <section className="student-profile-card">
                        <div className="profile-card-header">
                            <div className="profile-avatar">{avatarLetter}</div>

                            <div>
                                <h3>{student?.name || "Student"}</h3>
                                <p>{student?.email || "Email not available"}</p>
                            </div>

                            <span className="account-status">
                                ● Active account
                            </span>
                        </div>

                        <div className="profile-details">
                            <div className="detail-item">
                                <span>PRN</span>
                                <strong>{student?.prn || "—"}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Department</span>
                                <strong>{department || "—"}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Class Year</span>
                                <strong>{student?.classYear ?? "—"}</strong>
                            </div>

                            <div className="detail-item">
                                <span>Division</span>
                                <strong>{student?.division || "Not specified"}</strong>
                            </div>
                        </div>
                    </section>

                    <footer className="dashboard-footer">
                        SkillSync · Learn, Build, Collaborate.
                    </footer>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
