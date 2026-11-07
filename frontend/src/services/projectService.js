
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

export const projectService = {
    getAllProjects(token, params = {}) {
        const query = new URLSearchParams(params).toString();

        return request(
            `/projects${query ? `?${query}` : ""}`,
            token
        );
    },

    getMyProjects(token) {
        return request("/projects/me", token);
    },

    getProjectById(token, projectId) {
        return request(
            `/projects/${encodeURIComponent(projectId)}`,
            token
        );
    },

    createProject(token, projectData) {
        return request("/projects", token, {
            method: "POST",
            body: JSON.stringify(projectData),
        });
    },

    updateProject(token, projectId, updateData) {
        return request(
            `/projects/${encodeURIComponent(projectId)}`,
            token,
            {
                method: "PATCH",
                body: JSON.stringify(updateData),
            }
        );
    },

    replaceRequiredSkills(token, projectId, requiredSkills) {
        return request(
            `/projects/${encodeURIComponent(projectId)}/required-skills`,
            token,
            {
                method: "PUT",
                body: JSON.stringify({ requiredSkills }),
            }
        );
    },

};

