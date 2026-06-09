import { checkAuth, logout } from "./login.js";

const WORKOUT_API_URL = "http://localhost:8080/api/workouts";
const EXERCISE_API_URL = "http://localhost:8080/api/exercises";

// Constant Metric Lookups declared outside loops to optimize heap memory reuse
const MET_MATRIX = {
    "Weightlifting": { "Light": 3.0, "Moderate": 3.5, "Heavy": 6.0 },
    "Running":       { "Light": 8.3, "Moderate": 9.8, "Heavy": 11.8 },
    "Cycling":       { "Light": 5.8, "Moderate": 7.5, "Heavy": 10.0 },
    "HIIT":          { "Light": 5.0, "Moderate": 8.0, "Heavy": 11.0 },
    "Yoga":          { "Light": 2.5, "Moderate": 2.5, "Heavy": 2.5 }
};

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;

    setupNavigation();
    setupFormToggling();
});

/**
 * Handles basic navbar event wireframes
 */
function setupNavigation() {
    const signOutLink = document.getElementById("signOutLink");
    if (signOutLink) signOutLink.addEventListener("click", logout);

    const startWorkoutBtn = document.getElementById("startWorkoutBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const workoutModal = document.getElementById("workoutModal");

    if (startWorkoutBtn) startWorkoutBtn.addEventListener("click", () => workoutModal.classList.remove("hidden"));
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => workoutModal.classList.add("hidden"));
}

/**
 * Orchestrates form group visibility toggle maps based on workout categories
 */
function setupFormToggling() {
    const workoutTypeSelect = document.getElementById("workoutType");
    const workoutForm = document.getElementById("workoutForm");
    const workoutModal = document.getElementById("workoutModal");

    if (!workoutTypeSelect) return;

    // Mapping strategy: Clean, maintainable, and descriptive dictionary routing paths
    const fieldGroups = {
        distance: document.getElementById("distanceGroup") || document.querySelector(".form-group:nth-child(2)"),
        name:     document.getElementById("nameGroup")     || document.querySelector(".form-group:nth-child(3)"),
        reps:     document.getElementById("repsGroup")     || document.querySelector(".form-group:nth-child(4)"),
        sets:     document.getElementById("setsGroup")     || document.querySelector(".form-group:nth-child(5)"),
        weight:   document.getElementById("weightGroup")   || document.querySelector(".form-group:nth-child(6)"),
        intensity:document.getElementById("intensityGroup")|| document.querySelector(".form-group:nth-child(7)"),
        duration: document.getElementById("durationGroup") || document.querySelector(".form-group:nth-child(8)"),
        date:     document.getElementById("dateGroup")     || document.querySelector(".form-group:nth-child(9)")
    };

    workoutTypeSelect.addEventListener("change", () => {
        const selectedType = workoutTypeSelect.value;

        // Reset state configuration layers defaults cleanly
        Object.values(fieldGroups).forEach(group => { if (group) group.hidden = true; });
        if (fieldGroups.duration) fieldGroups.duration.hidden = false;
        if (fieldGroups.date) fieldGroups.date.hidden = false;

        // Toggle rulesets
        if (["Running", "Cycling", "Swimming"].includes(selectedType)) {
            if (fieldGroups.distance) fieldGroups.distance.hidden = false;
        } else if (selectedType === "Weightlifting") {
            ['name', 'reps', 'sets', 'weight', 'intensity'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].hidden = false; });
        } else if (selectedType === "HIIT") {
            if (fieldGroups.intensity) fieldGroups.intensity.hidden = false;
        }
    });

    if (workoutForm) {
        workoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (workoutModal) workoutModal.classList.add("hidden");
            submitWorkout(workoutTypeSelect.value, fieldGroups);
        });
    }
}

/**
 * Handles dual-stage API pipeline relational persistence transactions
 */
async function submitWorkout(selectedType, fieldGroups) {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) {
        alert("User session not found. Please log in again.");
        return;
    }

    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    const userWeight = userObj.weight && userObj.weight > 0 ? parseFloat(userObj.weight) : 70.0;

    // Extract DOM values cleanly into descriptive local references
    const elName = document.getElementById("name");
    const elIntensity = document.getElementById("intensity");
    const elDistance = document.getElementById("distance");
    const elReps = document.getElementById("reps");
    const elSets = document.getElementById("sets");
    const elWeight = document.getElementById("weight");
    const elDuration = document.getElementById("workoutDuration");
    const elDate = document.getElementById("workoutDate");

    const durationValue = elDuration ? parseInt(elDuration.value) || 0 : 0;
    const dateValue = elDate && elDate.value ? elDate.value : new Date().toISOString().split('T')[0];
    const distanceValue = elDistance ? parseFloat(elDistance.value) || 0 : 0;

    let intensityValue = elIntensity ? elIntensity.value : "Moderate";

    // 🌟 FIXED: Safe pace parsing order of operation constraints (highest benchmark evaluated first)
    // --- AUTOMATIC INTENSITY CALCULATOR BASED ON VELOCITY ---
    if (distanceValue > 0 && durationValue > 0) {
        // Calculate velocity in kilometers per hour (km/h)
        const paceKmh = distanceValue / (durationValue / 60);

        switch (selectedType) {
            case "Running":
                if (paceKmh >= 11.3) {
                    intensityValue = "Heavy";      // ~7+ mph pace
                } else if (paceKmh >= 9.6) {
                    intensityValue = "Moderate";   // ~6 mph pace
                } else {
                    intensityValue = "Light";      // ~5 mph or slower
                }
                break;

            case "Cycling":
                if (paceKmh >= 22.5) {
                    intensityValue = "Heavy";      // Strenuous fitness/racing
                } else if (paceKmh >= 19.3) {
                    intensityValue = "Moderate";   // Steady moderate effort
                } else {
                    intensityValue = "Light";      // Leisurely pace
                }
                break;

            case "Swimming":
                if (paceKmh >= 3.0) {
                    intensityValue = "Heavy";      // Fast interval training laps
                } else if (paceKmh >= 2.0) {
                    intensityValue = "Moderate";   // Continuous lap swimming
                } else {
                    intensityValue = "Light";      // Casual/relaxing pacing
                }
                break;

            default:
                // Fall back to the manual dropdown select choice if it's not a distance sport
                break;
        }
        console.log(`Calculated metric velocity for ${selectedType}: ${paceKmh.toFixed(2)} km/h. Intensity assigned: ${intensityValue}`);
    }

    const met = getMetValue(selectedType, intensityValue);
    const calculatedCalories = Math.round(met * userWeight * (durationValue / 60));

    // Phase 1 Payload Mapping
    const exercisePayload = {
        user: { id: userId },
        name: elName && !fieldGroups.name.hidden ? elName.value.trim() : selectedType,
        workoutType: selectedType,
        met: met
    };

    try {
        // --- PHASE 1: CHRONOLOGICAL EXERCISE LOG ---
        const exerciseResponse = await fetch(EXERCISE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(exercisePayload)
        });

        if (!exerciseResponse.ok) throw new Error("Failed to register exercise blueprint configuration.");
        const savedExercise = await exerciseResponse.json();

        // Phase 2 Payload Mapping: Conditional validation reads clean cache variables
        const workoutPayload = {
            user: { id: userId },
            exercise: { id: savedExercise.id },
            date: dateValue,
            duration: durationValue,
            calories: calculatedCalories,
            intensity: intensityValue,
            distance: fieldGroups.distance && !fieldGroups.distance.hidden ? distanceValue : null,
            reps: fieldGroups.reps && !fieldGroups.reps.hidden ? parseInt(elReps.value) || 0 : null,
            sets: fieldGroups.sets && !fieldGroups.sets.hidden ? parseInt(elSets.value) || 0 : null,
            weight: fieldGroups.weight && !fieldGroups.weight.hidden ? parseFloat(elWeight.value) || 0 : null
        };

        // --- PHASE 2: DEPENDENT WORKOUT ENTRY PERPETUATION ---
        const workoutResponse = await fetch(WORKOUT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workoutPayload)
        });

        if (!workoutResponse.ok) throw new Error("Failed to record active workout history profile.");

        alert("Workout logged successfully!");
        location.reload();

    } catch (error) {
        console.error("Pipeline failure:", error);
        alert(error.message);
    }
}

/**
 * Safely aggregates multidimensional array maps using fallback boundaries
 */
function getMetValue(workoutType, intensity) {
    if (!MET_MATRIX[workoutType] || !MET_MATRIX[workoutType][intensity]) {
        console.warn(`MET value not found for Type: ${workoutType}, Intensity: ${intensity}`);
        return 3.5;
    }
    return MET_MATRIX[workoutType][intensity];
}