import { isLoggedIn, logout } from "./auth.js";
import { calculateBMI} from "./fitnessMath.js";

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
function initializeDashboard() {
    const loggedIn = isLoggedIn();

    if (!loggedIn) {
        clearFormFields();
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
    const fields = ["feet", "inches", "lbs", "kg", "cm"];
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
    const bmiForm = document.getElementById("bmi-form");
    if (!bmiForm) return;

    bmiForm.addEventListener("submit", async (event) => {
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

        // Compute bmi calculation from helper module definitions
        const bmiResult = calculateBMI(unitSelect, targetWeight, targetHeight);
        const display = document.getElementById("resultMessage");

        if (bmiResult > 0) {
            display.innerHTML = `BMI = ${bmiResult.toFixed(2)} kg/m<sup>2</sup>`;
            await syncUpdatedUserData(targetWeight, targetHeight);
            displayBmi(bmiResult);
        } else {
            display.innerHTML = "Please enter valid values.";
        }
    });
}

/**
 * Normalizes input scales to metric standards and updates data buffers across backend clusters
 */
async function syncUpdatedUserData(weight, height) {
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
            alert("Metrics updated successfully!");
    } catch (error) {
        console.error("Network sync pipeline failure details:", error);
    }
}

function displayBmi(bmiValue) {
    const minBmi = 18.5;
    const maxBmi = 40;
    // Clamp the value so low or high scores don't break our container bounds
    let clampedBmi = Math.max(minBmi, Math.min(bmiValue, maxBmi));
    
    // Calculate your decimal ratio scale index (0.0 to 1.0)
    let percentage = (clampedBmi - minBmi) / (maxBmi - minBmi);
    
    // Convert to percentage form string
    let widthPercent = (percentage * 100) + "%";
    
    // Select the fill track and update its CSS width property directly
    const scaleFill = document.getElementById("bmiScaleFill");
    if (scaleFill) {
        scaleFill.style.width = widthPercent;
    }
}