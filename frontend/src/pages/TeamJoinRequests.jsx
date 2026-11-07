
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { joinRequestService } from "../services/joinRequestService";
import "./TeamJoinRequests.css";

const FILTERS = ["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];

function TeamJoinRequests() {
    const { teamId } = useParams();
    const { token } = useAuth();

    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState("");

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const result = await joinRequestService.getTeamJoinRequests(
                token,
                teamId,
                filter === "ALL" ? undefined : filter
            );

            setRequests(result.data || []);
        } catch (err) {
            setError(err.message || "Unable to load join requests.");
        } finally {
            setLoading(false);
        }
    }, [token, teamId, filter]);

    useEffect(() => {
        if (token && teamId) {
            loadRequests();
        }
    }, [token, teamId, loadRequests]);

    const handleAction = async (requestId, status) => {
        const action = status === "ACCEPTED" ? "accept" : "reject";

        if (!window.confirm(`Are you sure you want to ${action} this request?`)) {
            return;
        }

        try {
            setProcessingId(requestId);
            setError("");

            await joinRequestService.updateJoinRequest(
                token,
                requestId,
                status
            );

            await loadRequests();
        } catch (err) {
            setError(err.message || "Unable to update join request.");
        } finally {
            setProcessingId("");
        }
    };

    return (
        <div className="team-requests-page">
            <div className="team-requests-container">
                <div className="requests-breadcrumb">
                    <Link to={`/teams/${teamId}`}>Team Management</Link>
                    <span>/</span>
                    <span>Join Requests</span>
                </div>

                <header className="requests-header">
                    <div>
                        <span className="requests-eyebrow">TEAM MANAGEMENT</span>
                        <h1>Join Requests</h1>
                        <p>
                            Review students who want to join your project team.
                        </p>
                    </div>

                    <Link
                        to={`/teams/${teamId}`}
                        className="requests-back-link"
                    >
                        Back to Team
                    </Link>
                </header>

                {error && (
                    <div className="requests-error">
                        {error}
                        <button type="button" onClick={loadRequests}>
                            Retry
                        </button>
                    </div>
                )}

                <div className="requests-filters">
                    {FILTERS.map((item) => (
                        <button
                            type="button"
                            key={item}
                            className={filter === item ? "active" : ""}
                            onClick={() => setFilter(item)}
                        >
                            {item === "ALL" ? "All" : item}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="requests-empty">Loading join requests...</div>
                ) : requests.length === 0 ? (
                    <div className="requests-empty">
                        No join requests found for this filter.
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => {
                            const busy = processingId === request.id;
                            const student = request.student;

                            return (
                                <article
                                    className="request-card"
                                    key={request.id}
                                >
                                    <div className="request-card-top">
                                        <span
                                            className={`request-status request-status-${request.status?.toLowerCase()}`}
                                        >
                                            {request.status}
                                        </span>

                                        <span className="request-date">
                                            {request.createdAt
                                                ? new Date(request.createdAt).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "Recently"}
                                        </span>
                                    </div>

                                    <div className="request-student">
                                        <div className="request-avatar">
                                            {student?.name?.charAt(0)?.toUpperCase() || "S"}
                                        </div>

                                        <div>
                                            <h3>{student?.name || "Student"}</h3>
                                            <p>
                                                {[student?.department, student?.classYear]
                                                    .filter(Boolean)
                                                    .join(" · ") || "Student"}
                                            </p>
                                        </div>
                                    </div>

                                    {request.message && (
                                        <div className="request-message">
                                            <span>Message</span>
                                            <p>{request.message}</p>
                                        </div>
                                    )}

                                    {request.status === "PENDING" && (
                                        <div className="request-actions">
                                            <button
                                                type="button"
                                                className="request-accept"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleAction(request.id, "ACCEPTED")
                                                }
                                            >
                                                {busy ? "Updating..." : "Accept Request"}
                                            </button>

                                            <button
                                                type="button"
                                                className="request-reject"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleAction(request.id, "REJECTED")
                                                }
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeamJoinRequests;
