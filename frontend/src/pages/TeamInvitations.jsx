
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { matchingService } from "../services/matchingService";
import { invitationService } from "../services/invitationService";
import "./TeamInvitations.css";

function TeamInvitations() {
    const { teamId } = useParams();
    const { token } = useAuth();

    const [candidates, setCandidates] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [coverage, setCoverage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [candidateResult, invitationResult, coverageResult] =
                await Promise.all([
                    matchingService.getMatchingCandidates(token, teamId, {
                        page: 1,
                        limit: 20,
                    }),
                    invitationService.getTeamInvitations(token, teamId),
                    matchingService.getTeamSkillCoverage(token, teamId),
                ]);

            setCandidates(candidateResult.data || []);
            setInvitations(invitationResult.data || []);
            setCoverage(coverageResult.data || null);
        } catch (err) {
            setError(err.message || "Unable to load team invitations.");
        } finally {
            setLoading(false);
        }
    }, [token, teamId]);

    useEffect(() => {
        if (token && teamId) {
            loadData();
        }
    }, [token, teamId, loadData]);

    const handleInvite = async (candidate) => {
        const studentId = candidate.student?.id;

        if (!studentId) {
            setError("Student ID is missing. Unable to send invitation.");
            return;
        }

        try {
            setProcessingId(studentId);
            setError("");
            setSuccessMessage("");

            await invitationService.sendInvitation(
                token,
                teamId,
                studentId
            );

            setSuccessMessage(
                `Invitation sent to ${candidate.student?.name || "student"} successfully.`
            );

            await loadData();
        } catch (err) {
            setError(err.message || "Unable to send invitation.");
        } finally {
            setProcessingId("");
        }
    };

    const getInvitationForStudent = (studentId) => {
        return invitations.find(
            (invitation) =>
                invitation.inviteeId === studentId &&
                invitation.status === "PENDING"
        );
    };

    return (
        <div className="team-invitations-page">
            <div className="team-invitations-container">

                <div className="invitations-breadcrumb">
                    <Link to={`/teams/${teamId}`}>Team Management</Link>
                    <span>/</span>
                    <span>Invitations</span>
                </div>

                <header className="invitations-header">
                    <div>
                        <span className="invitations-eyebrow">
                            TEAM MANAGEMENT
                        </span>
                        <h1>Find Your Team Members</h1>
                        <p>
                            Discover students whose skills can strengthen
                            your project team.
                        </p>
                    </div>

                    <Link
                        to={`/teams/${teamId}`}
                        className="invitations-back-link"
                    >
                        Back to Team
                    </Link>
                </header>

                {error && (
                    <div className="invitations-alert invitations-alert-error">
                        {error}
                        <button type="button" onClick={loadData}>
                            Retry
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="invitations-alert invitations-alert-success">
                        {successMessage}
                    </div>
                )}

                {coverage && (
                    <section className="team-coverage-card">
                        <div>
                            <span className="coverage-label">
                                TEAM SKILL COVERAGE
                            </span>
                            <h2>Strengthen your team's skills</h2>
                            <p>
                                Review recommended students and the skills
                                they can contribute.
                            </p>
                        </div>

                        {coverage.members && (
                            <span className="coverage-members">
                                {coverage.members.length} team members
                            </span>
                        )}
                    </section>
                )}

                <section className="candidate-section">
                    <div className="candidate-section-heading">
                        <div>
                            <h2>Recommended Students</h2>
                            <p>
                                Recommendations are based on individual
                                matching and team skill improvement.
                            </p>
                        </div>

                        <span className="candidate-count">
                            {candidates.length} students
                        </span>
                    </div>

                    {loading ? (
                        <div className="candidate-empty">
                            Finding suitable students...
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="candidate-empty">
                            No recommended students found for this team.
                        </div>
                    ) : (
                        <div className="candidate-grid">
                            {candidates.map((candidate) => {
                                const student = candidate.student || {};
                                const pendingInvitation =
                                    getInvitationForStudent(student.id);

                                const busy =
                                    processingId === student.id;

                                return (
                                    <article
                                        className="candidate-card"
                                        key={student.id}
                                    >
                                        <div className="candidate-card-top">
                                            <div className="candidate-avatar">
                                                {student.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "S"}
                                            </div>

                                            <span className="candidate-score">
                                                {candidate.combinedScore ?? 0}% Match
                                            </span>
                                        </div>

                                        <h3>{student.name || "Student"}</h3>

                                        <p className="candidate-meta">
                                            {[student.department, student.classYear]
                                                .filter(Boolean)
                                                .join(" · ") || "Student"}
                                        </p>

                                        <div className="candidate-score-details">
                                            <span>
                                                Individual match:{" "}
                                                <strong>
                                                    {candidate.individualMatchScore ?? 0}%
                                                </strong>
                                            </span>

                                            <span>
                                                Team improvement:{" "}
                                                <strong>
                                                    {candidate.teamImprovementScore ?? 0}%
                                                </strong>
                                            </span>
                                        </div>

                                        <div className="candidate-skills-heading">
                                            Skills they bring
                                        </div>

                                        <div className="candidate-skills">
                                            {candidate.skillsAddedToTeam?.length > 0 ? (
                                                candidate.skillsAddedToTeam.map(
                                                    (skill, index) => (
                                                        <span key={`${skill}-${index}`}>
                                                            {typeof skill === "string"
                                                                ? skill
                                                                : skill.name}
                                                        </span>
                                                    )
                                                )
                                            ) : (
                                                <span>No additional skills listed</span>
                                            )}
                                        </div>

                                        {candidate.explanation?.length > 0 && (
                                            <ul className="candidate-explanation">
                                                {candidate.explanation.slice(0, 2).map(
                                                    (item, index) => (
                                                        <li key={index}>
                                                            {typeof item === "string"
                                                                ? item
                                                                : item.message || item.text}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}

                                        {candidate.hasPendingJoinRequest && (
                                            <p className="candidate-pending-note">
                                                This student has already requested
                                                to join your team.
                                            </p>
                                        )}

                                        {pendingInvitation ? (
                                            <button
                                                className="candidate-invited-button"
                                                disabled
                                            >
                                                Invitation Pending
                                            </button>
                                        ) : (
                                            <button
                                                className="candidate-invite-button"
                                                disabled={
                                                    busy ||
                                                    candidate.hasPendingJoinRequest
                                                }
                                                onClick={() => handleInvite(candidate)}
                                            >
                                                {busy
                                                    ? "Sending..."
                                                    : candidate.hasPendingJoinRequest
                                                        ? "Join Request Pending"
                                                        : "Send Invitation"}
                                            </button>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="sent-invitations-section">
                    <div className="candidate-section-heading">
                        <div>
                            <h2>Sent Invitations</h2>
                            <p>
                                Track invitations sent to students by your team.
                            </p>
                        </div>

                        <span className="candidate-count">
                            {invitations.length} invitations
                        </span>
                    </div>

                    {loading ? (
                        <div className="candidate-empty">
                            Loading sent invitations...
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="candidate-empty">
                            You haven't sent any invitations yet.
                        </div>
                    ) : (
                        <div className="sent-invitations-list">
                            {invitations.map((invitation) => (
                                <div
                                    className="sent-invitation-row"
                                    key={invitation.id}
                                >
                                    <div className="sent-invitation-avatar">
                                        {invitation.invitee?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "S"}
                                    </div>

                                    <div className="sent-invitation-info">
                                        <h3>
                                            {invitation.invitee?.name || "Student"}
                                        </h3>
                                        <p>
                                            {[invitation.invitee?.department,
                                                invitation.invitee?.classYear]
                                                .filter(Boolean)
                                                .join(" · ") || "Student"}
                                        </p>
                                    </div>

                                    <span
                                        className={`sent-invitation-status status-${invitation.status?.toLowerCase()}`}
                                    >
                                        {invitation.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}

export default TeamInvitations;
