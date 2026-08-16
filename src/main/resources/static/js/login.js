const LOGIN_API_URL = "/api/auth/login";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm"); 
    if (loginForm) {
        loginForm.addEventListener("submit", login);
    }
});

async function login(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
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
        
        alert("Login successful!");
        window.location.href = "/home";
    } catch (error) {
        alert(error.message);
    }
}