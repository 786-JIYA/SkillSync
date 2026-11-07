
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

export const invitationService = {
    // Send an invitation to a student.
    sendInvitation(token, teamId, inviteeId) {
        return request(
            `/teams/${encodeURIComponent(teamId)}/invitations`,
            token,
            {
                method: "POST",
                body: JSON.stringify({ inviteeId }),
            }
        );
    },

    // Get invitations sent by the team creator.
    getTeamInvitations(token, teamId) {
        return request(
            `/teams/${encodeURIComponent(teamId)}/invitations`,
            token
        );
    },

    // Get invitations received by the logged-in student.
    getMyInvitations(token, status) {
        const query = status
            ? `?status=${encodeURIComponent(status)}`
            : "";

        return request(`/invitations/me${query}`, token);
    },

    // Accept, reject, or cancel an invitation.
    updateInvitation(token, invitationId, status) {
        return request(
            `/invitations/${encodeURIComponent(invitationId)}`,
            token,
            {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }
        );
    },
};
