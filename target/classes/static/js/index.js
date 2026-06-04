const USER_API_URL = "http://localhost:8080/";
import { isLoggedIn } from "./login.js";

// Run auth-related routing logic separately
document.addEventListener("DOMContentLoaded", () => {
    if (isLoggedIn()) {
        window.location.href = "/home";
    }
});