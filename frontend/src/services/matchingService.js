
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, token) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
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

export const matchingService = {
    getRecommendedProjects(token, params = {}) {
        const query = new URLSearchParams(params).toString();

        return request(
            `/matching/projects${query ? `?${query}` : ""}`,
            token
        );
    },

    getTeamSkillCoverage(token, teamId) {
        return request(
            `/teams/${encodeURIComponent(teamId)}/skill-coverage`,
            token
        );
    },

    getMatchingCandidates(token, teamId, params = {}) {
        const query = new URLSearchParams(params).toString();

        return request(
            `/teams/${encodeURIComponent(teamId)}/matching/candidates${query ? `?${query}` : ""}`,
            token
        );
    },
};
