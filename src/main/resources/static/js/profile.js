import { checkAuth } from "./login.js";
import { calculateBMR, calculateTDEE } from "./fitnessMath.js";

const USER_API_URL = "http://localhost:8080/api/users";
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
        const unitSelect = document.getElementById("unitSelect");

        const userSession = sessionStorage.getItem("user");
        if (userSession) {
            const user = JSON.parse(userSession);

            // Pre-fill the display card with user info
            if(document.getElementById("displayName")) document.getElementById("displayName").textContent = `Name: ${user.name || ""}`;
            if(document.getElementById("displayGender")) document.getElementById("displayGender").textContent = `Gender: ${user.gender === 'M' ? 'Male' : 'Female' || ""}`;
            if(document.getElementById("displayAge")) document.getElementById("displayAge").textContent = `Age: ${user.age ? user.age + " years" : ""}`;
            if(document.getElementById("displayHeight")) document.getElementById("displayHeight").textContent = `Height: ${user.height ? user.height  : ""}`;
            if(document.getElementById("displayWeight")) document.getElementById("displayWeight").textContent = `Weight: ${user.weight ? user.weight : ""}`;
            if(document.getElementById("displayBMR")) document.getElementById("displayBMR").textContent = `BMR: ${user.bmr ? user.bmr : ""}`;
            if(document.getElementById("displayActivityLevel")) document.getElementById("displayActivityLevel").textContent = `Activity Level: ${getReadableActivityLevelText(user.activityLevel) || ""}`;
            if(document.getElementById("displayTDEE")) document.getElementById("displayTDEE").textContent = `TDEE: ${user.tdee ? user.tdee : ""}`;
            if(document.getElementById("displayFitnessGoal")) document.getElementById("displayFitnessGoal").textContent = `Fitness Goal: ${getReadableGoalText(user.fitnessGoal) || ""}`;
        }

        if (editProfileBtn) { 
            editProfileBtn.addEventListener("click", (event) => {
                event.preventDefault();
                profileCardDisplay.style.display = "none";
                profileCardEdit.style.display = "block";

                if (userSession) {
                    const user = JSON.parse(userSession);
                    if(document.getElementById("name")) document.getElementById("name").value = user.name || "";
                    if(document.getElementById("gender")) document.getElementById("gender").value = (user.gender === 'M' ? 'M' : 'F') || "";
                    if(document.getElementById("age")) document.getElementById("age").value = user.age || "";
                    if(document.getElementById("height")) document.getElementById("height").value = user.height || "";
                    if(document.getElementById("weight")) document.getElementById("weight").value = user.weight || "";
                    if(document.getElementById("bmr")) document.getElementById("bmr").value = user.bmr || "";
                    if(document.getElementById("activityLevel")) document.getElementById("activityLevel").value = user.activityLevel || "";
                    if(document.getElementById("tdee")) document.getElementById("tdee").value = user.tdee || "";
                    if(document.getElementById("fitnessGoal")) document.getElementById("fitnessGoal").value = getReadableGoalText(user.fitnessGoal) || "";
                    
                    // Run conversion setup based on current state
                    updateUnits();
                }
            });
        }
        
        if (unitSelect) {
            unitSelect.addEventListener("change", updateUnits);
        }

            
            //finding BMR
            const calculateBMRBtn = document.getElementById("calculateBMRBtn");
            if (calculateBMRBtn) {
                calculateBMRBtn.addEventListener("click", (event) => {
                    event.preventDefault();
                    const height = parseFloat(document.getElementById("height").value);
                    const weight = parseFloat(document.getElementById("weight").value);
                    const age = parseInt(document.getElementById("age").value);
                    const gender = document.getElementById("gender").value;
                   if (isNaN(height) || isNaN(weight) || isNaN(age) || !gender) {
                        alert("Please enter valid height, weight, age, and gender values to calculate BMR.");
                        return;
                    }
                    console.log(`Height input: ${height}, Weight input: ${weight}`); // Debugging log
                    const bmr = calculateBMR(unitSelect, weight, height, age, gender);
                    console.log(`Calculated BMR: ${bmr}`); // Debugging log
                    if (document.getElementById("bmr")) document.getElementById("bmr").value = bmr ? bmr.toFixed(2) : "";
                });
            }

        //finding activity level and TDEE
        const activityLevelSelect = document.getElementById("activityLevel");
        if (activityLevelSelect) {
            activityLevelSelect.addEventListener("change", (event) => {
                event.preventDefault();
                const activityLevel = event.target.value;
                const bmrValue = parseFloat(document.getElementById("bmr").value);
                if (isNaN(bmrValue)) {
                    alert("Please calculate BMR first before selecting activity level.");
                    return;
                }
            });
        }

        const calculateTDEEBtn = document.getElementById("calculateTDEEBtn");
        if (calculateTDEEBtn) {
            calculateTDEEBtn.addEventListener("click", (event) => {
                event.preventDefault();
                const bmrValue = parseFloat(document.getElementById("bmr").value);
                const activityLevel = document.getElementById("activityLevel").value;
                if (isNaN(bmrValue) || isNaN(activityLevel)) {
                    alert("Please ensure you have calculated BMR and selected an activity level to calculate TDEE.");
                    return;
                }
                console.log("activityLevel:", activityLevel); // Debugging log
                console.log("bmrValue:", bmrValue); // Debugging log
                const tdee = calculateTDEE(bmrValue, activityLevel);
                if (document.getElementById("tdee")) document.getElementById("tdee").value = tdee ? tdee.toFixed(2) : "";
            });
        }

        const saveProfileBtn = document.getElementById("saveProfileBtn");
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener("click", (event) => {
                event.preventDefault();
                profileCardDisplay.style.display = "block";
                profileCardEdit.style.display = "none";

                //store the updated info in session storage
                let userSession = sessionStorage.getItem("user");
                if (userSession) {
                    const user = JSON.parse(userSession);
                    user.name = document.getElementById("name").value || user.name;
                    user.gender = (document.getElementById("gender").value === "M" ? "M" : "F") || user.gender;
                    user.age = parseInt(document.getElementById("age").value) || user.age;
                    user.height = parseFloat(document.getElementById("height").value) || user.height;
                    user.weight = parseFloat(document.getElementById("weight").value) || user.weight;
                    user.activityLevel = (document.getElementById("activityLevel").value || user.activityLevel);
                    user.tdee = parseFloat(document.getElementById("tdee").value) || user.tdee;
                    user.fitnessGoal = (document.getElementById("fitnessGoal").value || user.fitnessGoal);


                    console.log("Updated user object before saving to session and syncing:", user); // Debugging log
                    sessionStorage.setItem("user", JSON.stringify(user));
                    //Send the entire user object payload to your new unified sync endpoint
                    fetch(`${USER_API_URL}/${user.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user) // Passing the complete object!
                    })
                    .then(response => {
                        console.log("Response from server after profile update:", response); // Debugging log
                        if (!response.ok) {
                            throw new Error("Failed to sync user profile data with database.");
                        }
                        console.log("Profile synchronized successfully.");
                    })
                    .catch(error => console.error("Error:", error));

                    // Update the display card with new info
                    // Pre-fill the display card text fields cleanly on page load
                    if(document.getElementById("displayName")) document.getElementById("displayName").textContent = `Name: ${user.name || ""}`;
                    if(document.getElementById("displayGender")) document.getElementById("displayGender").textContent = `Gender: ${(user.gender === 'M' ? 'Male' : 'Female') || ""}`;
                    if(document.getElementById("displayAge")) document.getElementById("displayAge").textContent = `Age: ${user.age ? user.age + " years" : ""}`;
                    if(document.getElementById("displayHeight")) document.getElementById("displayHeight").textContent = `Height: ${user.height ? user.height + " cm" : ""}`;
                    if(document.getElementById("displayWeight")) document.getElementById("displayWeight").textContent = `Weight: ${user.weight ? user.weight + " kg" : ""}`;
                    if(document.getElementById("displayActivityLevel")) document.getElementById("displayActivityLevel").textContent = `Activity Level: ${getReadableActivityLevelText(user.activityLevel)}`;
                    if(document.getElementById("displayTDEE")) document.getElementById("displayTDEE").textContent = `TDEE: ${user.tdee ? user.tdee + " kcal/day" : ""}`;
                    if(document.getElementById("displayFitnessGoal")) document.getElementById("displayFitnessGoal").textContent = `Fitness Goal: ${getReadableGoalText(user.fitnessGoal)}`;
                }

                
               
            });
        }
    });

// Function to update the text labels
function updateUnits() {
    const unitSelect = document.getElementById("unitSelect");
    const heightUnit = document.getElementById("heightUnit");
    const weightUnit = document.getElementById("weightUnit");

    if (!unitSelect || !heightUnit || !weightUnit) return;

    if (unitSelect.value === "metric") {
        heightUnit.textContent = " cm";
        weightUnit.textContent = " kg";
    } else {
        heightUnit.textContent = " inches";
        weightUnit.textContent = " lbs";
    }
}


function getReadableGoalText(goalValue) {
    const goalMap = {
        "MILD_LOSS": "Mild Weight Loss (~0.25 kg/week)",
        "WEIGHT_LOSS": "Weight Loss (~0.5 kg/week)",
        "MAINTAIN": "Maintain Current Weight",
        "WEIGHT_GAIN": "Muscle Building / Weight Gain (~0.25 kg/week)",
        "HEAVY_GAIN": "Aggressive Weight Gain (~0.5 kg/week)"
    };
    
    return goalMap[goalValue] || "";
}

function getReadableActivityLevelText(activityLevelValue) {
    const activityLevelMap = {
        "1.2": "Sedentary (little or no exercise)",
        "1.375": "Lightly Active (light exercise/sports 1-3 days/week)",
        "1.55": "Moderately Active (moderate exercise/sports 3-5 days/week)",
        "1.725": "Very Active (hard exercise/sports 6-7 days a week)",
        "1.9": "Extra Active (very hard exercise/sports & physical job or 2x training)"
    };
    
    return activityLevelMap[activityLevelValue] || "";
}