
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

export const skillService = {
    getAllSkills(token, params = {}) {
        const query = new URLSearchParams(params).toString();

        return request(
            `/skills${query ? `?${query}` : ""}`,
            token
        );
    },

    getMySkills(token) {
        return request("/students/me/skills", token);
    },

    addOrUpdateSkill(token, skillId, proficiency) {
        return request(`/students/me/skills/${skillId}`, token, {
            method: "PUT",
            body: JSON.stringify({ proficiency }),
        });
    },

    deleteSkill(token, skillId) {
        return request(`/students/me/skills/${skillId}`, token, {
            method: "DELETE",
        });
    },
};
