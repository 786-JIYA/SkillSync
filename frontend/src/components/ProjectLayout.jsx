
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProjectLayout({ title, breadcrumb, children }) {
    const { student, logout } = useAuth();
    const navigate = useNavigate();

    const department =
        typeof student?.department === "object"
            ? student?.department?.name
            : student?.department;

    const firstName = student?.name?.split(" ")[0] || "Student";
    const initial = firstName.charAt(0).toUpperCase();

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

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
                        className="nav-item"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span>⌂</span> Overview
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/skills")}
                    >
                        <span>✦</span> My Skills
                    </button>

                    <button className="nav-item active">
                        <span>▣</span> Projects
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">{initial}</div>
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
                        <p className="breadcrumb">{breadcrumb}</p>
                        <h2>{title}</h2>
                    </div>

                    <div className="topbar-profile">
                        <div className="user-avatar">{initial}</div>
                        <span>{student?.name || "Student"}</span>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}

export default ProjectLayout;
