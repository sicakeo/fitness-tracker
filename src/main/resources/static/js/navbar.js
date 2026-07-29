import { isLoggedIn } from "./login.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
});

function initializeDashboard() {
    const loggedIn = isLoggedIn();
    const authLinksLi = document.getElementById("authLinksLi");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    const profileDropdown = document.getElementById("profileDropdown");
    const profileDropdownMenu = document.getElementById("profileDropdownMenu");


    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
           if(navMenu) navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
        });
    }

    if (loggedIn && authLinksLi && profileDropdown) {
        authLinksLi.style.display = "none";
        profileDropdown.classList.remove("hidden");
    }

    if (profileDropdown && profileDropdownMenu) {
        profileDropdown.addEventListener("click", (e) => {
            profileDropdownMenu.style.display = profileDropdownMenu.style.display === "block" ? "none" : "block";
        });
    }
}