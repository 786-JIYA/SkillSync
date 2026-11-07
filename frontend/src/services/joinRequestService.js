
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, token, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });
    } catch {
        throw new Error(
            "Cannot connect to the server. Check whether the backend is running."
        );
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        const error = new Error(
            result.message || "Something went wrong. Please try again."
        );
        error.status = response.status;
        error.code = result.code;
        throw error;
    }

    return result;
}

export const joinRequestService = {
    // Send a request to join a team.
    createJoinRequest(token, teamId, message = "") {
        return request(
            `/teams/${encodeURIComponent(teamId)}/join-requests`,
            token,
            {
                method: "POST",
                body: JSON.stringify({ message }),
            }
        );
    },

    // Get join requests received by the logged-in student.
    getMyJoinRequests(token, status) {
        const query = status
            ? `?status=${encodeURIComponent(status)}`
            : "";

        return request(`/join-requests/me${query}`, token);
    },

    // Get requests received by a team.
    getTeamJoinRequests(token, teamId, status) {
        const query = status
            ? `?status=${encodeURIComponent(status)}`
            : "";

        return request(
            `/teams/${encodeURIComponent(teamId)}/join-requests${query}`,
            token
        );
    },

    // Accept, reject, or cancel a join request.
    updateJoinRequest(token, requestId, status) {
        return request(
            `/join-requests/${encodeURIComponent(requestId)}`,
            token,
            {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }
        );
    },
};
