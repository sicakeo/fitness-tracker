document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
           if(navMenu) navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
        });
    }
});