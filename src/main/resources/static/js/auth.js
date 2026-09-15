export function isLoggedIn(){
    return Boolean(sessionStorage.getItem("jwt_token"));
}

export function checkAuth() {
    if (!isLoggedIn()) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("jwt_token");
        alert("Logged out successfully");
        window.location.href = "/";
        return false;
    }
    return true;
}

function isAdminLoggedIn(){
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    return isLoggedIn() && user.role === "ADMIN";
}

export function logout(){
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("jwt_token");
    alert("Log out successfully")
    window.location.href = "/";
}

/**
 * Centralized fetch wrapper that automatically appends the Bearer token.
 * Replace all standard `fetch(URL, options)` calls with `fetchWithAuth(URL, options)`.
 */
export async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem("jwt_token");
    
    // Ensure headers object exists
    if (!options.headers) {
        options.headers = {};
    }
    
    // Append the token if it exists
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Enforce JSON content type by default for PUT/POST
    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }

    const response = await fetch(url, options);

    // Auto-logout if the token is expired or invalid
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Session expired. Please log in again.");
    }

    return response;
}



