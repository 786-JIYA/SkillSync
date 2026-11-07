
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { teamService } from "../services/teamService";
import "./TeamManagement.css";

function TeamManagement() {
    const { teamId } = useParams();
    const { token, student } = useAuth();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchTeam = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await teamService.getTeamById(token, teamId);
            setTeam(response.data);
        } catch (err) {
            setError(err.message || "Unable to load team.");
        } finally {
            setLoading(false);
        }
    }, [token, teamId]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const isCreator =
        team?.project?.creatorId === student?.id ||
        team?.members?.some(
            (member) =>
                member.studentId === student?.id &&
                member.role === "CREATOR"
        );

    const isMember = team?.members?.some(
        (member) => member.studentId === student?.id
    );

    const handleLeaveTeam = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to leave this team?"
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            await teamService.leaveTeam(token, teamId);
            navigate("/projects");
        } catch (err) {
            setError(err.message || "Unable to leave team.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="team-management-state">Loading team...</div>;
    }

    if (error && !team) {
        return (
            <div className="team-management-state">
                <p>{error}</p>
                <button onClick={fetchTeam}>Try again</button>
            </div>
        );
    }

    if (!team) return null;

    return (
        <main className="team-management-page">
            <header className="team-management-header">
                <div>
                    <Link to="/projects" className="team-back-link">
                        ← Browse projects
                    </Link>
                    <p className="team-eyebrow">TEAM WORKSPACE</p>
                    <h1>{team.project?.title || "Team Management"}</h1>
                    <p className="team-subtitle">
                        Manage your project team and collaboration.
                    </p>
                </div>

                <span className="team-status">
                    {team.project?.status || "ACTIVE"}
                </span>
            </header>

            {error && <div className="team-error">{error}</div>}

            <section className="team-overview-grid">
                <article className="team-overview-card">
                    <span className="team-card-label">Team members</span>
                    <strong>{team.memberCount ?? team.members?.length ?? 0}</strong>
                </article>

                <article className="team-overview-card">
                    <span className="team-card-label">Your role</span>
                    <strong>{isCreator ? "Creator" : isMember ? "Member" : "Viewer"}</strong>
                </article>

                <article className="team-overview-card">
                    <span className="team-card-label">Project status</span>
                    <strong>{team.project?.status || "—"}</strong>
                </article>
            </section>

            <section className="team-management-section">
                <div className="team-section-heading">
                    <div>
                        <h2>Team members</h2>
                        <p>Students currently working on this project.</p>
                    </div>
                    <span>{team.members?.length || 0} members</span>
                </div>

                <div className="team-member-list">
                    {team.members?.map((member) => (
                        <article
                            className="team-member-card"
                            key={member.studentId}
                        >
                            <div className="team-member-avatar">
                                {member.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>

                            <div className="team-member-info">
                                <h3>
                                    {member.name}
                                    {member.studentId === student?.id && " (You)"}
                                </h3>
                                <p>{member.role}</p>
                            </div>

                            <span className="team-member-badge">
                                {member.role}
                            </span>
                        </article>
                    ))}

                    {!team.members?.length && (
                        <p className="team-empty">No team members found.</p>
                    )}
                </div>
            </section>

            {isCreator && (
                <section className="team-management-section">
                    <div className="team-section-heading">
                        <div>
                            <h2>Manage collaboration</h2>
                            <p>Review requests and invite suitable teammates.</p>
                        </div>
                    </div>

                    <div className="team-action-grid">
                        <Link
                            to={`/teams/${teamId}/invitations`}
                            className="team-action-card"
                        >
                            <span className="team-action-icon">✉</span>
                            <div>
                                <h3>Invitations & candidates</h3>
                                <p>Find matching students and send invitations.</p>
                            </div>
                            <span>→</span>
                        </Link>

                        <Link
                            to={`/teams/${teamId}/requests`}
                            className="team-action-card"
                        >
                            <span className="team-action-icon">↗</span>
                            <div>
                                <h3>Join requests</h3>
                                <p>Review students who want to join your team.</p>
                            </div>
                            <span>→</span>
                        </Link>
                    </div>
                </section>
            )}

            {isMember && !isCreator && (
                <section className="team-danger-section">
                    <div>
                        <h2>Leave this team</h2>
                        <p>
                            You will lose your membership in this project team.
                        </p>
                    </div>

                    <button
                        onClick={handleLeaveTeam}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Leaving..." : "Leave team"}
                    </button>
                </section>
            )}
        </main>
    );
}

export default TeamManagement;
