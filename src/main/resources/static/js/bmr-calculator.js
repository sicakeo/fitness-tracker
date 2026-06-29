import { isLoggedIn, logout } from "./login.js";
import { calculateBMR } from "./fitnessMath.js";

const USER_API_URL = "http://localhost:8080/api/users";
let unitSelect = "standard"; // State variable tracking active metric choice

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboard();
    setupUnitToggleListeners();
    setupFormSubmission();
});

/**
 * Initializes authentication views and handles demographic profile field hydration
 */
function initializeDashBoard() {
    if (!isLoggedIn()) {
        clearFormFields();
        return;
    }

    // Remap user layout context details to navbar controls
    const navRight = document.getElementById("nav-right");
    if (navRight) {
        navRight.innerHTML = `<li><span id="signOutLink" class="logout-text" style="cursor:pointer; color:#1083ea;">Sign out</span></li>`;
        document.getElementById("signOutLink").addEventListener("click", logout);
    }

    hydrateFieldsFromSession();
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

    // Convert metrics to imperial baseline figures safely
    const totalInches = heightCms / 2.54;
    const feetValue = Math.floor(totalInches / 12);
    const inchesValue = Math.round(totalInches % 12);
    const weightLbs = weightKgs * 2.20462;

    // Populating imperial elements
    setInputValues({
        feet: heightCms > 0 ? feetValue : "",
        inches: heightCms > 0 ? inchesValue : "",
        lbs: weightKgs > 0 ? weightLbs.toFixed(1) : "",
        // Populating fallback metric element baselines
        cm: heightCms > 0 ? heightCms.toFixed(1) : "",
        kg: weightKgs > 0 ? weightKgs.toFixed(1) : "",
        age: user.age || "",
        gender: user.gender || ""
    });
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
 * Handles explicit target resets when authorization states expire
 */
function clearFormFields() {
    const fields = ["feet", "inches", "lbs", "kg", "cm", "age", "gender"];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

/**
 * Binds click controls to unit selections, cleanly handling swaps using classes
 */
function setupUnitToggleListeners() {
    const btnStandard = document.getElementById("standard-btn");
    const btnMetric = document.getElementById("metric-btn");
    
    const groupStdHeight = document.getElementById("standard-height-group");
    const groupStdWeight = document.getElementById("standard-weight-group");
    const groupMetHeight = document.getElementById("metric-height-group");
    const groupMetWeight = document.getElementById("metric-weight-group");

    if (!btnStandard || !btnMetric) return;

    btnStandard.addEventListener("click", () => {
        unitSelect = "standard";
        toggleVisibility(btnStandard, btnMetric, [groupStdHeight, groupStdWeight], [groupMetHeight, groupMetWeight]);
    });

    btnMetric.addEventListener("click", () => {
        unitSelect = "metric";
        toggleVisibility(btnMetric, btnStandard, [groupMetHeight, groupMetWeight], [groupStdHeight, groupStdWeight]);
    });
}

/**
 * Handles class list assignments and styling states cleanly
 */
function toggleVisibility(activeBtn, inactiveBtn, showElements, hideElements) {
    activeBtn.style.backgroundColor = "#2ecc71";
    activeBtn.style.color = "white";
    inactiveBtn.style.backgroundColor = "#dee2e6";
    inactiveBtn.style.color = "#495057";

    showElements.forEach(el => el?.classList.remove("hidden"));
    hideElements.forEach(el => el?.classList.add("hidden"));
}

/**
 * Intercepts form submit actions, validates inputs, and triggers REST pipeline transmissions
 */
function setupFormSubmission() {
    const bmrForm = document.getElementById("bmr-form");
    if (!bmrForm) return;

    bmrForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        let targetHeight = 0;
        let targetWeight = 0;

        if (unitSelect === "standard") {
            const feet = parseFloat(document.getElementById("feet").value) || 0;
            const inches = parseFloat(document.getElementById("inches").value) || 0;
            targetHeight = (feet * 12) + inches;
            targetWeight = parseFloat(document.getElementById("lbs").value) || 0;
        } else {
            targetHeight = parseFloat(document.getElementById("cm").value) || 0;
            targetWeight = parseFloat(document.getElementById("kg").value) || 0;
        }

        const age = parseInt(document.getElementById("age").value) || 0;
        const gender = document.getElementById("gender").value.trim().toLowerCase();

        // Compute BMR calculation from helper module definitions
        const bmrResult = calculateBMR(unitSelect, targetWeight, targetHeight, age, gender);
        const display = document.getElementById("resultMessage");

        if (bmrResult > 0) {
            display.innerHTML = `BMR = ${bmrResult.toFixed(1)} kcal/day`;
            await syncUpdatedUserData(targetWeight, targetHeight, age, gender);
        } else {
            display.innerHTML = "Please enter valid values.";
        }
    });
}

/**
 * Normalizes input scales to metric standards and updates data buffers across backend clusters
 */
async function syncUpdatedUserData(weight, height, age, gender) {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;

    const user = JSON.parse(userSession);
    
    // Standardize metrics into standardized metric formats before backend storage save routines execution
    const metricWeight = unitSelect === "standard" ? weight * 0.453592 : weight;
    const metricHeight = unitSelect === "standard" ? height * 2.54 : height;

    const updatedUser = {
        ...user,
        weight: parseFloat(metricWeight.toFixed(2)),
        height: parseFloat(metricHeight.toFixed(2)),
        age: age,
        gender: gender.toUpperCase() // Keep consistency with backend enum standards
    };

    // Update local storage buffer immediately for snappy client navigation updates
    sessionStorage.setItem("user", JSON.stringify(updatedUser));

    try {
        const response = await fetch(`${USER_API_URL}/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

        if (!response.ok) throw new Error("Database transaction profile storage sync failed.");
        console.log("Database updated profile successfully.");
    } catch (error) {
        console.error("Network sync pipeline failure details:", error);
    }
}