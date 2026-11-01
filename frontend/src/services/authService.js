
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
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
        error.errors = result.errors || [];
        throw error;
    }

    return result;
}

export const authService = {
    register(data) {
        return request("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    login(data) {
        return request("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getMe(token) {
        return request("/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
