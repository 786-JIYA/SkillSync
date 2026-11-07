
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectService } from "../services/projectService";
import { joinRequestService } from "../services/joinRequestService";
import { matchingService } from "../services/matchingService";
import { invitationService } from "../services/invitationService";
import "./ProjectDetails.css";

function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { token, student } = useAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [joinMessage, setJoinMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState("");
    const [joinError, setJoinError] = useState("");
    const [requestSent, setRequestSent] = useState(false);

    const [candidates, setCandidates] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState("");
    const [processingStudentId, setProcessingStudentId] = useState(null);
    const [invitationSuccess, setInvitationSuccess] = useState("");

    // Load project details
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
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadProject();

        return () => {
            active = false;
        };
    }, [token, projectId]);

    // Determine creator and team
    const isCreator =
        project && student && project.creatorId === student.id;

    const teamId = project?.team?.id || project?.teamId;

    // Load recommendations and invitation history
    useEffect(() => {
        let active = true;

        const loadRecommendations = async () => {
            if (!isCreator || !teamId || !token) return;

            try {
                setRecommendationsLoading(true);
                setRecommendationsError("");

                const [candidateResult, invitationResult] = await Promise.all([
                    matchingService.getMatchingCandidates(token, teamId, {
                        page: 1,
                        limit: 20,
                    }),
                    invitationService.getTeamInvitations(token, teamId),
                ]);

                if (active) {
                    setCandidates(candidateResult.data || []);
                    setInvitations(invitationResult.data || []);
                }
            } catch (err) {
                if (active) {
                    setRecommendationsError(
                        err.message || "Unable to load recommendations."
                    );
                }
            } finally {
                if (active) {
                    setRecommendationsLoading(false);
                }
            }
        };

        loadRecommendations();

        return () => {
            active = false;
        };
    }, [isCreator, teamId, token]);

    function formatStatus(status) {
        return status?.replaceAll("_", " ") || "Unknown";
    }

    // Loading state
    if (loading) {
        return (
            <div className="project-details-message">
                Loading project details...
            </div>
        );
    }

    // Error state
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

    const currentStudentIsMember = members.some(
        (member) =>
            member.studentId === student?.id ||
            member.student?.id === student?.id
    );

    const teamIsFull =
        members.length >= project.preferredTeamSize;

    // Send join request
    async function handleJoinRequest(event) {
        event.preventDefault();

        if (!teamId) {
            setJoinError("Team information is unavailable.");
            return;
        }

        setSubmitting(true);
        setJoinError("");
        setJoinSuccess("");

        try {
            const result = await joinRequestService.createJoinRequest(
                token,
                teamId,
                joinMessage.trim()
            );

            setRequestSent(true);
            setJoinSuccess(
                result.message || "Your join request was sent successfully!"
            );
            setJoinMessage("");
        } catch (err) {
            setJoinError(
                err.message || "Unable to send your join request."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // Send invitation to recommended student
    const handleInvite = async (candidate) => {
        const studentId = candidate.student?.id;

        if (!studentId || !teamId) return;

        try {
            setProcessingStudentId(studentId);
            setInvitationSuccess("");
            setRecommendationsError("");

            await invitationService.sendInvitation(
                token,
                teamId,
                studentId
            );

            setInvitationSuccess(
                `Invitation sent to ${candidate.student?.name || "student"}.`
            );

            const result = await invitationService.getTeamInvitations(
                token,
                teamId
            );

            setInvitations(result.data || []);
        } catch (err) {
            setRecommendationsError(
                err.message || "Unable to send invitation."
            );
        } finally {
            setProcessingStudentId(null);
        }
    };

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

                    {/* Project Header */}
                    <div className="details-hero">
                        <div>
                            <span
                                className={`details-status ${project.status?.toLowerCase()}`}
                            >
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
                        {/* Left Column */}
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
                                    <span>
                                        {requiredSkills.length} skills
                                    </span>
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
                                                key={
                                                    item.skillId ||
                                                    item.skill?.id
                                                }
                                            >
                                                <div>
                                                    <strong>
                                                        {item.skill?.name || "Skill"}
                                                    </strong>

                                                    <small>
                                                        {item.skill?.category || "General"}
                                                    </small>
                                                </div>

                                                <span
                                                    className={
                                                        item.importance === "REQUIRED"
                                                            ? "required-label"
                                                            : "optional-label"
                                                    }
                                                >
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

                        {/* Right Column */}
                        <div className="details-right">
                            <section className="details-card project-info-card">
                                <h2>Project Information</h2>

                                <div className="info-row">
                                    <span>Status</span>
                                    <strong>
                                        {formatStatus(project.status)}
                                    </strong>
                                </div>

                                <div className="info-row">
                                    <span>Preferred Team Size</span>
                                    <strong>
                                        {project.preferredTeamSize} students
                                    </strong>
                                </div>

                                <div className="info-row">
                                    <span>Current Team Members</span>
                                    <strong>
                                        {project.team?._count?.members ??
                                            members.length}
                                    </strong>
                                </div>

                                <div className="info-row">
                                    <span>Department</span>
                                    <strong>
                                        {project.creator?.department?.name ||
                                            "Not specified"}
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
                                            {project.creator?.department?.name ||
                                                "Student"}
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
                                            key={
                                                member.studentId ||
                                                member.student?.id
                                            }
                                        >
                                            <div className="team-member-avatar">
                                                {member.student?.name?.charAt(0) ||
                                                    member.name?.charAt(0) ||
                                                    "S"}
                                            </div>

                                            <div>
                                                <strong>
                                                    {member.student?.name ||
                                                        member.name ||
                                                        "Student"}
                                                </strong>

                                                <small>{member.role}</small>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </section>

                            {/* Request to Join */}
                            {!isCreator && !currentStudentIsMember && (
                                <section className="details-card join-request-card">
                                    <h2>Interested in Joining?</h2>

                                    {requestSent ? (
                                        <div className="join-request-success">
                                            <strong>Request Sent!</strong>
                                            <p>{joinSuccess}</p>
                                        </div>
                                    ) : project.status !== "OPEN" ? (
                                        <p className="details-muted">
                                            This project is not accepting new members.
                                        </p>
                                    ) : teamIsFull ? (
                                        <p className="details-muted">
                                            This team has reached its preferred team size.
                                        </p>
                                    ) : (
                                        <>
                                            <p className="details-muted">
                                                Send a request to the project creator
                                                to join this team.
                                            </p>

                                            <form onSubmit={handleJoinRequest}>
                                                <textarea
                                                    className="join-request-textarea"
                                                    value={joinMessage}
                                                    onChange={(event) =>
                                                        setJoinMessage(event.target.value)
                                                    }
                                                    placeholder="Introduce yourself or explain why you want to join (optional)"
                                                    rows={4}
                                                    maxLength={500}
                                                />

                                                <button
                                                    type="submit"
                                                    className="join-request-button"
                                                    disabled={submitting}
                                                >
                                                    {submitting
                                                        ? "Sending..."
                                                        : "Request to Join"}
                                                </button>
                                            </form>

                                            {joinError && (
                                                <p className="join-request-error">
                                                    {joinError}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Recommended Students */}
                    {isCreator && (
                        <section className="details-card recommended-students-section">
                            <h2>Recommended Students</h2>

                            <p className="details-muted">
                                Students recommended by SkillSync based on your
                                team's skill requirements.
                            </p>

                            {recommendationsLoading ? (
                                <p className="details-muted">
                                    Finding recommended students...
                                </p>
                            ) : recommendationsError ? (
                                <p className="join-request-error">
                                    {recommendationsError}
                                </p>
                            ) : candidates.length === 0 ? (
                                <p className="details-muted">
                                    No recommended students found yet.
                                </p>
                            ) : (
                                <div className="recommended-students-list">
                                    {candidates.map((candidate) => {
                                        const recommendedStudent =
                                            candidate.student;

                                        return (
                                            <div
                                                className="recommended-student"
                                                key={recommendedStudent?.id}
                                            >
                                                <div>
                                                    <h3>
                                                        {recommendedStudent?.name ||
                                                            "Student"}
                                                    </h3>

                                                    <p>
                                                        {recommendedStudent?.department?.name ||
                                                            recommendedStudent?.department ||
                                                            "Department not specified"}
                                                    </p>

                                                    <strong>
                                                        Match Score:{" "}
                                                        {candidate.combinedScore ?? 0}%
                                                    </strong>

                                                    {candidate.skillsAddedToTeam?.length > 0 && (
                                                        <p>
                                                            Skills contributed:{" "}
                                                            {candidate.skillsAddedToTeam
                                                                .map((skill) =>
                                                                    skill.name || skill
                                                                )
                                                                .join(", ")}
                                                        </p>
                                                    )}

                                                    {candidate.explanation?.map(
                                                        (item, index) => (
                                                            <p key={index}>
                                                                {item}
                                                            </p>
                                                        )
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="join-request-button"
                                                    onClick={() =>
                                                        handleInvite(candidate)
                                                    }
                                                    disabled={
                                                        !recommendedStudent?.id ||
                                                        processingStudentId ===
                                                        recommendedStudent?.id
                                                    }
                                                >
                                                    {processingStudentId ===
                                                        recommendedStudent?.id
                                                        ? "Sending..."
                                                        : "Send Invitation"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {invitationSuccess && (
                                <p className="join-request-success">
                                    {invitationSuccess}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Invitation History */}
                    {isCreator && (
                        <section className="details-card invitation-history-section">
                            <h2>Invitation History</h2>

                            {invitations.length === 0 ? (
                                <p className="details-muted">
                                    You haven't sent any invitations yet.
                                </p>
                            ) : (
                                <div className="invitation-history-list">
                                    {invitations.map((invitation) => (
                                        <div
                                            className="invitation-history-item"
                                            key={invitation.id}
                                        >
                                            <div>
                                                <strong>
                                                    {invitation.invitee?.name ||
                                                        invitation.student?.name ||
                                                        "Student"}
                                                </strong>

                                                <p>
                                                    {invitation.invitee?.department?.name ||
                                                        invitation.student?.department?.name ||
                                                        "Department not specified"}
                                                </p>
                                            </div>

                                            <span
                                                className={`invitation-status ${invitation.status?.toLowerCase()}`}
                                            >
                                                {invitation.status || "Unknown"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </section>
            </main>
        </div>
    );
}

export default ProjectDetails;
