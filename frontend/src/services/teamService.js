
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
        throw error;
    }

    return result;
}

export const teamService = {
    getTeamById(token, teamId) {
        return request(
            `/teams/${encodeURIComponent(teamId)}`,
            token
        );
    },

    leaveTeam(token, teamId) {
        return request(
            `/teams/${encodeURIComponent(teamId)}/members/me`,
            token,
            { method: "DELETE" }
        );
    },
};
