export function isLoggedIn(){
    return Boolean(sessionStorage.getItem("user"));
}

export function checkAuth() {
    if (!isLoggedIn()) {
        alert("Access Denied. Please log in to view this page.");
        window.location.href = "/login";
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
    alert("Log out successfully")
    window.location.href = "/";
}

