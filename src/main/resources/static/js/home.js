import { checkAuth, logout } from "./login.js"; 

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;

    // 1. Grab your text element
    const signOutLink = document.getElementById("signOutLink");
    
    // 2. Attach the click listener directly to your logout function
    if (signOutLink) {
        signOutLink.addEventListener("click", logout);
    }

    // ... Rest of your unit selection code continues here ...
    const unitSelect = document.getElementById("unitSelect");
});