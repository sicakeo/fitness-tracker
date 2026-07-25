document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    const profileDropdown = document.getElementById("profileDropdown");
    const profileDropdownMenu = document.getElementById("profileDropdownMenu");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
           if(navMenu) navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
        });
    }

    if (profileDropdown && profileDropdownMenu) {
        profileDropdown.addEventListener("click", (e) => {
            profileDropdownMenu.style.display = profileDropdownMenu.style.display === "block" ? "none" : "block";
        });
    }

});