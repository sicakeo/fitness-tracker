import { isLoggedIn, logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    initializeDashboard();
});

const desktopView = window.matchMedia("(min-width: 1024px)");
//Run skeleton loader only in desktop mode
function handleBreakpointChange(e){
    if(e.matches){ 
        initializeNavbar();
    }
}

handleBreakpointChange(desktopView);

desktopView.addEventListener("change", handleBreakpointChange);

function setupNavigation() {
    const loggedIn = isLoggedIn();
    const authLinksLi = document.getElementById("authLinksLi");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    const profileDropdown = document.getElementById("profileDropdown");
    const profileDropdownMenu = document.getElementById("profileDropdownMenu");
    const signOutLink = document.getElementById("signOutLink");

    if (signOutLink) signOutLink.addEventListener("click", logout);

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
           if(navMenu) {
                navMenu?.classList.remove("hidden");
                navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
            }
        });
    }

    if (loggedIn && authLinksLi && profileDropdown) {
        authLinksLi.style.display = "none";
    }

    if (profileDropdown && profileDropdownMenu) {
        profileDropdown.addEventListener("click", (e) => {
            profileDropdownMenu.style.display = profileDropdownMenu.style.display === "block" ? "none" : "block";
        });
    }
}

//Handle skeleton effect
function initializeNavbar(){
    const navSkeleton = document.getElementById("navSkeletonWrapper");
    const navMenu = document.getElementById("navMenu");
    const profileName = document.getElementById("profileName");
    const profileDropdown = document.getElementById("profileDropdown");
    const profileSkeletonWrapper = document.getElementById("profileSkeletonWrapper");
    // Simulate checking auth/session storage state fields
    const userSession = sessionStorage.getItem("user");

    if (userSession) {
        const userObj = JSON.parse(userSession);
        
        // 1. Hydrate the real UI nodes safely
        if (profileName) {
            profileName.textContent = userObj.name || "Username";
        }

        // 2. Smoothly hand over the display from skeleton to real navigation elements
        // A minor timeout makes sure the swap doesn't look like a harsh flash
        setTimeout(() => {
            navSkeleton?.classList.add("hidden");
            navMenu?.classList.remove("hidden");
            profileDropdown?.classList.remove("hidden");
            profileSkeletonWrapper?.classList.add("hidden");
        }, 400);
    }
    else {
        navSkeleton?.classList.add("hidden");
        profileSkeletonWrapper?.classList.add("hidden");
        navMenu?.classList.remove("hidden");        
    }
}

function initializeDashboard(){
    const loader = document.getElementById("loader");
    const content = document.querySelector(".page-content");
    const links = document.querySelectorAll(".transition-link");

    // 1. PAGE LOAD: Hide spinner and reveal content
    setTimeout(() => {
        loader.classList.add("hidden");
        if (content) content.classList.add("visible");
    }, 500); // 500ms delay ensures user sees the loader briefly

    // 2. PAGE NAVIGATE: Intercept clicks to animate exit
    links.forEach(link => {
        link.addEventListener("click", (e) => {
        // Don't interrupt target="_blank" or external links
        if (link.hostname === window.location.hostname && !link.target) {
            e.preventDefault(); // Stop instant navigation
            const targetUrl = link.href;

            // Show the loader again
            loader.classList.remove("hidden");
            if (content) content.classList.remove("visible");

            // Wait for the CSS fade transition to finish before redirecting
            setTimeout(() => {
            window.location.href = targetUrl;
            }, 400); // Matches the CSS transition time (0.4s)
        }
        });
    });
}