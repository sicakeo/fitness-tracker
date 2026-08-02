import { checkAuth, logout } from "./auth.js";
import { calculateBMR, calculateTDEE, getReadableActivityLevelText, getReadableGoalText } from "./fitnessMath.js";

const USER_API_URL = "http://localhost:8080/api/users";
document.addEventListener("DOMContentLoaded", () => {
    setUpNavigation();
    hydrateFieldsFromSession();
    setUpFormSubmission();
});

function setUpNavigation() {
    if(!checkAuth()) {
        return;
    }
    const signOutLink = document.getElementById("signOutLink");
    if (signOutLink) signOutLink.addEventListener("click", logout);

    
    const editBtn = document.getElementById("editBtn");
    const cancelBtn = document.getElementById("closeBtn");
    const calculateBMRBtn = document.getElementById("calculateBMRBtn");
    const calculateTDEEBtn = document.getElementById("calculateTDEEBtn");
    const profileModal = document.getElementById("profileModal");

    if (editBtn) editBtn.addEventListener("click", () => {profileModal.classList.remove("hidden")});
    if (cancelBtn) cancelBtn.addEventListener("click", () => {profileModal.classList.add("hidden")});
    if (calculateBMRBtn) calculateBMRBtn.addEventListener("click", handleBmrCalculation);
    if (calculateTDEEBtn) calculateTDEEBtn.addEventListener("click", handleTdeeCalculation);
}

/**
 * Reads background session strings and populates inputs with appropriate metric scaling conversions
 */

function hydrateFieldsFromSession() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;

    const user = JSON.parse(userSession);
    const weightKgs = user.weight || 0;
    const heightCms = user.height || 0;

    // Populating imperial elements
    setLabelText({
        displayName: `Name: ${user.name || ""}`,
        displayAge: `Age: ${user.age ? user.age + " years" : ""}`,
        displayGender: `Gender: ${user.gender === 'M' ? 'Male' : 'Female'}`,
        displayWeight: `Weight: ${weightKgs ? weightKgs + " kg" : ""}`,
        displayHeight: `Height: ${heightCms? heightCms + " cm" : ""}`,
        displayBMR: `BMR: ${user.bmr || "0.0"}`,
        displayActivityLevel: `Activity Level: ${getReadableActivityLevelText(user.activityLevel)}`,
        displayTDEE: `TDEE: ${user.tdee || "0.0"} kcal/day`,
        displayFitnessGoal: `Fitness Goal: ${getReadableGoalText(user.fitnessGoal)}`
    });
    
    const editButton = document.getElementById("editBtn");
    if(editButton){
        setInputValues({
            name: user.name || "",
            age: user.age || "",
            gender: (user.gender === 'M' ? 'Male' : 'Female') || "",
            height: heightCms > 0 ? heightCms.toFixed(1) : "",
            weight: weightKgs > 0 ? weightKgs.toFixed(1) : "",
            activityLevel: getReadableActivityLevelText(user.activityLevel || ""),
            tdee: user.tdee || "",
            fitnessGoal: getReadableGoalText( user.fitnessGoal || "")
        });
    }
}
/**
 * Loops across key maps to assign value attributes cleanly
 */
function setInputValues(fields) {
    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
}
/**
 * Updates text containers using textContent safely
 */
function setLabelText(labels) {
    Object.entries(labels).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
}

function setUpFormSubmission(){
    const profileForm = document.getElementById("profileForm");
    if(!profileForm)
        return;
    profileForm.addEventListener("submit", async (event)=>{
        event.preventDefault();
        const name = document.getElementById("name").value || "";
        const age = document.getElementById("age").value || "";
        const gender = document.getElementById("gender").value || "";
        const weight = parseFloat(document.getElementById("weight").value).toFixed(2) || 0;
        const height = parseFloat(document.getElementById("height").value).toFixed(2) || 0;
        const activityLevel = document.getElementById("activityLevel").value || "";
        const tdee = document.getElementById("tdee").value || 0;
        
        await syncUpdatedUserData(name, age, gender, weight, height, activityLevel, tdee);
        setLabelText({
            displayName: `Name: ${name}`,
            displayAge: `Age: ${age} years`,
            displayGender: `Gender: ${gender === 'M' ? 'Male' : 'Female'}`,
            displayWeight: `Weight: ${weight} kg`,
            displayHeight: `Height: ${height} cm`,
            displayActivityLevel: `Activity Level: ${getReadableActivityLevelText(activityLevel)}`,
            displayTDEE: `TDEE: ${tdee} kcal/day`,
            displayFitnessGoal: `Fitness Goal: ${getReadableGoalText(fitnessGoal)}`
        });

        document.getElementById("profileModal")?.classList.add("hidden");
    });
}

/**
 * Normalizes input scales to metric standards and updates data buffers across backend clusters
 */
async function syncUpdatedUserData(name , age, gender, weight, height, activityLevel, tdee) {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;

    const user = JSON.parse(userSession);
    const updatedUser = {
        ...user,
        name: name,
        weight: weight,
        height: height,
        age: age,
        gender: gender.toUpperCase(), // Keep consistency with backend enum standards
        activityLevel: activityLevel,
        tdee: tdee
    };

    // Update local storage buffer immediately for snappy client navigation updates
    sessionStorage.setItem("user", JSON.stringify(updatedUser));

    try {
        const response = await fetch(`${USER_API_URL}/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        if (!response.ok){
            const errorData = await response.json();
            const serverErrorMessage = errorData.errors 
                ? Object.values(errorData.errors).join("\n") 
                : (errorData.message || "Failed to synchronize metrics with server.");
                
            throw new Error(serverErrorMessage);
        }

        const responseData = await response.json();
        sessionStorage.setItem("user", JSON.stringify(responseData));
        alert("Profile updated successfully");
    } catch (error) {
        console.error("Network sync pipeline failure details:", error);
        alert(error.message);
    }
}


/**
 * Handles calculation event for BMR inputs
 */
function handleBmrCalculation(event) {
    event.preventDefault();
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const age = parseInt(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;

    if (isNaN(height) || isNaN(weight) || isNaN(age) || !gender) {
        alert("Please enter valid height, weight, age, and gender values to calculate BMR.");
        return;
    }

    const bmr = calculateBMR("metric", weight, height, age, gender);
    const bmrInput = document.getElementById("bmr");
    if (bmrInput) bmrInput.value = bmr ? bmr.toFixed(2) : "";
}

/**
 * Handles calculation event for TDEE inputs
 */
function handleTdeeCalculation(event) {
    event.preventDefault();
    const bmrValue = parseFloat(document.getElementById("bmr").value);
    const activityLevel = document.getElementById("activityLevel").value;

    if (isNaN(bmrValue) || !activityLevel) {
        alert("Please ensure you have calculated BMR and selected an activity level to calculate TDEE.");
        return;
    }

    const tdee = calculateTDEE(bmrValue, activityLevel);
    const tdeeInput = document.getElementById("tdee");
    if (tdeeInput) tdeeInput.value = tdee ? tdee.toFixed(2) : "";
}