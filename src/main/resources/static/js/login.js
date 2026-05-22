const LOGIN_API_URL = "http://localhost:8080/api/users/login"

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
        if (!response.ok)
            throw new Error("Your username or password may be incorrect");
        const responseData = await response.json();
        sessionStorage.setItem("user", JSON.stringify(responseData));
        alert("Login succsessfully");
        window.location.href = "/home";
    } catch (error){
        alert(error.message);
    }
}


function isLoggedIn(){
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
    window.location.href = "/";
}

// Ensure this only runs on the login page where the form actually exists
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm"); // Make sure your HTML <form> has id="loginForm"
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
});