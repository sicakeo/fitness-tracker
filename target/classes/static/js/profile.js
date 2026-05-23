import { checkAuth } from "./login.js";
document.addEventListener("DOMContentLoaded", () => {
    if(!checkAuth()) return;

    const signOutLink = document.getElementById("signOutLink");
    if (signOutLink) {
        signOutLink.addEventListener("click", (event) => {
            // 1. Prevent the default empty link jump behavior
            event.preventDefault();

            // 2. Clear out the session memory completely
            sessionStorage.removeItem("user");

            // 3. Optional: Give them a friendly confirmation message
            alert("You have been signed out successfully.");

            // 4. Safely redirect them back to the clean Home/Dashboard path!
            window.location.href = "/";
        });
    }

    const profileCardDisplay = document.getElementById("profileCardDisplay");
    const profileCardEdit = document.getElementById("profileCardEdit");
    const editProfileBtn = document.getElementById("editProfileBtn");
    if (editProfileBtn) { //edit profile
        editProfileBtn.addEventListener("click", (event) => {
            event.preventDefault();
            profileCardDisplay.style.display = "none";
            profileCardEdit.style.display = "block";

            const unitSelect = document.getElementById("unitSelect");
            const heightUnit = document.getElementById("heightUnit");
            const weightUnit = document.getElementById("weightUnit");

            const userSession = sessionStorage.getItem("user");
            if (userSession) {
            const user = JSON.parse(userSession);

            // If your user object has a saved unit system preference (e.g., "metric")
            if (user & user.unitSystem) {
            unitSelect.value = user.unitSystem;
            }
            }

            // 1. Listen for whenever the user changes the dropdown option
            if (unitSelect) {
            unitSelect.addEventListener("change", updateUnits);
            }

            // 2. Run it immediately on page load to match the initial default dropdown state
            updateUnits();
            });


            //finding BMR
            const bmrStartBtn = document.getElementById("bmrStartBtn");
            if (bmrStartBtn) {
                bmrStartBtn.addEventListener("click", (event) => {
                    event.preventDefault();
                    const activityLevelOptions = window.document.createElement("div");
                    activityLevelOptions.id = "activity-level-options";
                    activityLevelOptions.innerHTML = `
                        <h3>Select Your Activity Level:</h3>
                        <button data-level="sedentary">Sedentary (little or no exercise)</button>
                        <button data-level="light">Lightly active (light exercise/sports 1-3 days/week)</button>
                        <button data-level="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</button>
                        <button data-level="active">Active (hard exercise/sports 6-7 days a week)</button>
                        <button data-level="very-active">Very active (very hard exercise/sports & physical job or 2x training)</button>
                    `;
                    document.body.appendChild(activityLevelOptions);

                    // Add event listeners to each button to capture the user's selection
                    const buttons = activityLevelOptions.querySelectorAll("button");
                    buttons.forEach(button => {
                        button.addEventListener("click", () => {
                            const selectedLevel = button.getAttribute("data-level");
                            const activityLevelValue = button.textContent;
                            document.body.removeChild(activityLevelOptions); // Clean up the options after selection
                            //set the BMR message and display the calculated BMR based on the selected activity level (this is where you'd implement the actual BMR calculation logic)
                            document.getElementById("bmrMessage").textContent = `BMR: ${selectedLevel}. (BMR calculation based on this will be implemented here.)`;
                            document.getElementById("DisplayBMR").textContent = `BMR: ${selectedLevel} kcal/day`; // Placeholder text
                        });
                    });
                });
            }

        const saveProfileBtn = document.getElementById("saveProfileBtn");
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener("click", (event) => {
                event.preventDefault();
                console.log("Profile saved! (This is where you'd implement the actual save logic.)");
                profileCardDisplay.style.display = "block";
                profileCardEdit.style.display = "none";
            });
        }
    }
});

// Function to update the text labels
function updateUnits() {
    const selectedUnit = unitSelect.value;

    if (selectedUnit === "metric") {
        heightUnit.textContent = " cm";
        weightUnit.textContent = " kg";
    } else {
        // Standard / Imperial system
        heightUnit.textContent = " inches";
        weightUnit.textContent = " lbs";
    }
}