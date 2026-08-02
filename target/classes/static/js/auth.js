const LOGIN_API_URL = "http://localhost:8080/api/users/login"


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm"); 
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
});

async function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const role = username === "root" ? "ADMIN" : "USER";

    try {
        const response = await fetch(`${LOGIN_API_URL}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password, role})
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 400) {
                throw new Error("Your username or password may be incorrect.");
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "The authentication server is temporarily unavailable. Please try again later.");
        }
        const responseData = await response.json();
        sessionStorage.setItem("user", JSON.stringify(responseData));
        alert("Login succsessfully");
        window.location.href = "/home";
    } catch (error){
        alert(error.message);
    }
}


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

