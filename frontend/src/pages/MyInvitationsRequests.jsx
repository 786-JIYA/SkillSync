
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { invitationService } from "../services/invitationService";
import { joinRequestService } from "../services/joinRequestService";
import { projectService } from "../services/projectService";
import "./MyInvitationsRequests.css";

const FILTERS = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];

function formatDate(date) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function MyInvitationsRequests() {
    const { token } = useAuth();

    const [invitations, setInvitations] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);

    const [invitationFilter, setInvitationFilter] = useState("ALL");
    const [requestFilter, setRequestFilter] = useState("ALL");
    const [incomingFilter, setIncomingFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [processingId, setProcessingId] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch received invitations, sent join requests
            // and projects created by the logged-in student.
            const [
                invitationResult,
                requestResult,
                projectResult,
            ] = await Promise.all([
                invitationService.getMyInvitations(
                    token,
                    invitationFilter === "ALL"
                        ? undefined
                        : invitationFilter
                ),

                joinRequestService.getMyJoinRequests(
                    token,
                    requestFilter === "ALL"
                        ? undefined
                        : requestFilter
                ),

                projectService.getMyProjects(token),
            ]);

            setInvitations(invitationResult.data || []);
            setJoinRequests(requestResult.data || []);

            // Get incoming join requests for every project team.
            const projects = projectResult.data || [];

            const teamProjects = projects.filter(
                (project) => project.team?.id
            );

            const incomingResults = await Promise.all(
                teamProjects.map(async (project) => {
                    const result =
                        await joinRequestService.getTeamJoinRequests(
                            token,
                            project.team.id,
                            incomingFilter === "ALL"
                                ? undefined
                                : incomingFilter
                        );

                    return (result.data || []).map((request) => ({
                        ...request,
                        team: {
                            ...request.team,
                            project:
                                request.team?.project || project,
                        },
                    }));
                })
            );

            setIncomingRequests(incomingResults.flat());

        } catch (err) {
            setError(
                err.message ||
                "Unable to load your invitations and requests."
            );
        } finally {
            setLoading(false);
        }
    }, [
        token,
        invitationFilter,
        requestFilter,
        incomingFilter,
    ]);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token, loadData]);

    const handleInvitationAction = async (invitationId, status) => {
        try {
            setProcessingId(invitationId);
            setActionError("");

            await invitationService.updateInvitation(
                token,
                invitationId,
                status
            );

            await loadData();
        } catch (err) {
            setActionError(
                err.message || "Unable to update invitation."
            );
        } finally {
            setProcessingId("");
        }
    };

    const handleRequestAction = async (requestId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this join request?"
        );

        if (!confirmed) return;

        try {
            setProcessingId(requestId);
            setActionError("");

            await joinRequestService.updateJoinRequest(
                token,
                requestId,
                "CANCELLED"
            );

            await loadData();
        } catch (err) {
            setActionError(
                err.message || "Unable to cancel join request."
            );
        } finally {
            setProcessingId("");
        }
    };

    const handleIncomingRequestAction = async (
        requestId,
        status
    ) => {
        const action = status === "ACCEPTED" ? "accept" : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this join request?`
        );

        if (!confirmed) return;

        try {
            setProcessingId(requestId);
            setActionError("");

            await joinRequestService.updateJoinRequest(
                token,
                requestId,
                status
            );

            await loadData();
        } catch (err) {
            setActionError(
                err.message || "Unable to update join request."
            );
        } finally {
            setProcessingId("");
        }
    };

    const renderFilters = (selected, onChange) => (
        <div className="my-activity-filters">
            {FILTERS.map((filter) => (
                <button
                    key={filter}
                    type="button"
                    className={selected === filter ? "active" : ""}
                    onClick={() => onChange(filter)}
                >
                    {filter === "ALL"
                        ? "All"
                        : filter.replace("_", " ")}
                </button>
            ))}
        </div>
    );

    return (
        <div className="my-activity-page">
            <div className="my-activity-container">

                <div className="my-activity-header">
                    <div>
                        <span className="my-activity-eyebrow">
                            COLLABORATION
                        </span>

                        <h1>Invitations & Requests</h1>

                        <p>
                            Keep track of project invitations,
                            your join requests and requests
                            received for your projects.
                        </p>
                    </div>

                    <Link
                        to="/projects"
                        className="my-activity-browse"
                    >
                        Browse Projects
                    </Link>
                </div>

                {error && (
                    <div className="my-activity-error">
                        {error}

                        <button
                            type="button"
                            onClick={loadData}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {actionError && (
                    <div className="my-activity-error">
                        {actionError}
                    </div>
                )}

                {loading ? (
                    <div className="my-activity-empty">
                        Loading your activity...
                    </div>
                ) : (
                    <>
                        {/* RECEIVED INVITATIONS */}

                        <section className="my-activity-section">
                            <div className="my-activity-section-heading">
                                <div>
                                    <h2>Received Invitations</h2>
                                    <p>
                                        Invitations sent to you by
                                        project creators.
                                    </p>
                                </div>

                                <span className="my-activity-count">
                                    {invitations.length}
                                </span>
                            </div>

                            {renderFilters(
                                invitationFilter,
                                setInvitationFilter
                            )}

                            <div className="my-activity-list">
                                {invitations.map((invitation) => {
                                    const busy =
                                        processingId === invitation.id;

                                    return (
                                        <article
                                            className="my-activity-card"
                                            key={invitation.id}
                                        >
                                            <div className="my-activity-card-top">
                                                <span
                                                    className={`activity-status status-${invitation.status?.toLowerCase()}`}
                                                >
                                                    {invitation.status}
                                                </span>

                                                <span className="activity-date">
                                                    {formatDate(invitation.createdAt)}
                                                </span>
                                            </div>

                                            <h3>
                                                {invitation.team?.project?.title ||
                                                    "Project invitation"}
                                            </h3>

                                            <p className="activity-description">
                                                Invited by{" "}
                                                <strong>
                                                    {invitation.inviter?.name ||
                                                        "A student"}
                                                </strong>

                                                {invitation.inviter?.department
                                                    ? ` · ${invitation.inviter.department}`
                                                    : ""}
                                            </p>

                                            {invitation.team?.project?.id && (
                                                <Link
                                                    className="activity-project-link"
                                                    to={`/projects/${invitation.team.project.id}`}
                                                >
                                                    View Project
                                                </Link>
                                            )}

                                            {invitation.status === "PENDING" && (
                                                <div className="activity-actions">
                                                    <button
                                                        type="button"
                                                        className="activity-accept"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            handleInvitationAction(
                                                                invitation.id,
                                                                "ACCEPTED"
                                                            )
                                                        }
                                                    >
                                                        {busy
                                                            ? "Updating..."
                                                            : "Accept"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="activity-reject"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            handleInvitationAction(
                                                                invitation.id,
                                                                "REJECTED"
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}

                                {invitations.length === 0 && (
                                    <div className="my-activity-empty">
                                        No invitations found for this filter.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* MY SENT JOIN REQUESTS */}

                        <section className="my-activity-section">
                            <div className="my-activity-section-heading">
                                <div>
                                    <h2>My Join Requests</h2>
                                    <p>
                                        Track requests you have sent
                                        to project teams.
                                    </p>
                                </div>

                                <span className="my-activity-count">
                                    {joinRequests.length}
                                </span>
                            </div>

                            {renderFilters(
                                requestFilter,
                                setRequestFilter
                            )}

                            <div className="my-activity-list">
                                {joinRequests.map((request) => {
                                    const busy =
                                        processingId === request.id;

                                    return (
                                        <article
                                            className="my-activity-card"
                                            key={request.id}
                                        >
                                            <div className="my-activity-card-top">
                                                <span
                                                    className={`activity-status status-${request.status?.toLowerCase()}`}
                                                >
                                                    {request.status}
                                                </span>

                                                <span className="activity-date">
                                                    {formatDate(request.createdAt)}
                                                </span>
                                            </div>

                                            <h3>
                                                {request.team?.project?.title ||
                                                    "Project join request"}
                                            </h3>

                                            {request.message && (
                                                <p className="activity-message">
                                                    "{request.message}"
                                                </p>
                                            )}

                                            {request.team?.project?.id && (
                                                <Link
                                                    className="activity-project-link"
                                                    to={`/projects/${request.team.project.id}`}
                                                >
                                                    View Project
                                                </Link>
                                            )}

                                            {request.status === "PENDING" && (
                                                <div className="activity-actions">
                                                    <button
                                                        type="button"
                                                        className="activity-reject"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            handleRequestAction(
                                                                request.id
                                                            )
                                                        }
                                                    >
                                                        {busy
                                                            ? "Cancelling..."
                                                            : "Cancel Request"}
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}

                                {joinRequests.length === 0 && (
                                    <div className="my-activity-empty">
                                        No join requests found for this filter.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* INCOMING JOIN REQUESTS */}

                        <section className="my-activity-section">
                            <div className="my-activity-section-heading">
                                <div>
                                    <h2>Incoming Join Requests</h2>
                                    <p>
                                        Students who have requested
                                        to join teams of your projects.
                                    </p>
                                </div>

                                <span className="my-activity-count">
                                    {incomingRequests.length}
                                </span>
                            </div>

                            {renderFilters(
                                incomingFilter,
                                setIncomingFilter
                            )}

                            <div className="my-activity-list">
                                {incomingRequests.map((request) => {
                                    const busy =
                                        processingId === request.id;

                                    return (
                                        <article
                                            className="my-activity-card"
                                            key={request.id}
                                        >
                                            <div className="my-activity-card-top">
                                                <span
                                                    className={`activity-status status-${request.status?.toLowerCase()}`}
                                                >
                                                    {request.status}
                                                </span>

                                                <span className="activity-date">
                                                    {formatDate(request.createdAt)}
                                                </span>
                                            </div>

                                            <h3>
                                                {request.team?.project?.title ||
                                                    "Your project"}
                                            </h3>

                                            <p className="activity-description">
                                                Request from{" "}
                                                <strong>
                                                    {request.student?.name ||
                                                        "A student"}
                                                </strong>
                                            </p>

                                            {request.student?.department && (
                                                <p className="activity-description">
                                                    Department:{" "}
                                                    {request.student.department}
                                                </p>
                                            )}

                                            {request.student?.classYear && (
                                                <p className="activity-description">
                                                    Class Year:{" "}
                                                    {request.student.classYear}
                                                </p>
                                            )}

                                            {request.message && (
                                                <p className="activity-message">
                                                    "{request.message}"
                                                </p>
                                            )}

                                            {request.team?.project?.id && (
                                                <Link
                                                    className="activity-project-link"
                                                    to={`/projects/${request.team.project.id}`}
                                                >
                                                    View Project
                                                </Link>
                                            )}

                                            {request.status === "PENDING" && (
                                                <div className="activity-actions">
                                                    <button
                                                        type="button"
                                                        className="activity-accept"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            handleIncomingRequestAction(
                                                                request.id,
                                                                "ACCEPTED"
                                                            )
                                                        }
                                                    >
                                                        {busy
                                                            ? "Updating..."
                                                            : "Accept"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="activity-reject"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            handleIncomingRequestAction(
                                                                request.id,
                                                                "REJECTED"
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}

                                {incomingRequests.length === 0 && (
                                    <div className="my-activity-empty">
                                        No incoming join requests found
                                        for this filter.
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                )}

            </div>
        </div>
    );
}

export default MyInvitationsRequests;
