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
    //if (!checkAuth()) return;
    setupNavigation();
    setupFormToggling();
    loadTodayCaloriesRing()
    loadTodayHistory()
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
    const closeHistoryBtn = document.getElementById("closeHistoryBtn");
    const historyModal = document.getElementById("historyModal");

    if (startWorkoutBtn) startWorkoutBtn.addEventListener("click", () => workoutModal.classList.remove("hidden"));
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => workoutModal.classList.add("hidden"));
    if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", () => historyModal.classList.add("hidden"));
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
    const inputName = (elName && !fieldGroups.name.hidden ? elName.value.trim() : "");
    let intensityValue = elIntensity ? elIntensity.value : "Moderate";

    // FIXED: Safe pace parsing order of operation constraints (highest benchmark evaluated first)
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
    const element = document.getElementById("netCaloriesDisplay");
    if(element) element.setAttribute("data-target", calculatedCalories);
    console.log("element", element.getAttribute("data-target"));
   
    // Phase 1 Payload Mapping
    const exercisePayload = {
        user: { id: userId },
        name:   inputName || selectedType,
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
        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            // Grab the current visible calories on screen (e.g., if they already had 200 kcal logged today)
            const existingCalories = parseInt(netDisplay.innerText) || 0;
            const updatedTotalTarget = existingCalories + calculatedCalories;

            // Update the data-target data boundary attribute link directly
            netDisplay.setAttribute("data-target", updatedTotalTarget);
        }

        // --- TRIGGER ANIMATION LAYER WITHOUT RESETTING PAGE ---
        displayRing();

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



function displayRing(){
    const netDisplay = document.getElementById("netCaloriesDisplay");
    const targetDisplay = document.getElementById("targetCaloriesDisplay");
    const circle = document.getElementById("calorieFillCircle");

    // Parse target calorie numbers
    const targetCalories = parseInt(targetDisplay.innerText);
    const finalCalories = parseInt(netDisplay.getAttribute("data-target"));
    
    // Calculate the maximum stroke circumference based on radius (r=80)
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius; // Approx 502.65

    let currentCalories = 0;
    
    // Determine animation speed based on how large the number is
    const duration = 10000; // total animation time in ms
    const steps = 60; 
    const stepTime = Math.max(duration / steps, 10); // Don't let interval go below 10ms

    const interval = setInterval(() => {
        if (finalCalories <= 0 || currentCalories >= finalCalories) {
            netDisplay.innerText = finalCalories || 0;
            clearInterval(interval);
            return;
        }

        const incrementStep = Math.max(Math.ceil(finalCalories / 50), 1);
        currentCalories += incrementStep;

        if (currentCalories > finalCalories) currentCalories = finalCalories;
        // 1. Update text display
        netDisplay.innerText = currentCalories;

        // 2. Calculate percentage and map to circle offset
        const percentage = currentCalories / targetCalories;
        // Ensure offset doesn't go negative if calories exceed target
        const offset = circumference - (Math.min(percentage, 1) * circumference); 
        
        circle.style.strokeDashoffset = offset;
    }, stepTime);
}


/**
 * Fetches total daily logged calories from backend and animates the progress ring
 */
async function loadTodayCaloriesRing() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;

    const userObj = JSON.parse(userSession);
    const userId = userObj.id;

    // Generate current local system date in exact YYYY-MM-DD format
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        // Fetch only the compiled integer sum directly from the endpoint
        const response = await fetch(`${WORKOUT_API_URL}/today-calories?userId=${userId}&date=${todayStr}`);

        if (!response.ok) throw new Error("Failed to sync calorie historical records.");

        const totalCaloriesToday = await response.json();
        console.log(`Total calories: ${totalCaloriesToday}`);
        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            // Set the target attribute link that displayRing reads from
            netDisplay.setAttribute("data-target", totalCaloriesToday);

            // Run your animation engine cleanly!
            displayRing();
        }
    } catch (error) {
        console.error("Dashboard hydration error:", error);

        // Quiet fallback so the UI doesn't visually hang on network lag
        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            netDisplay.setAttribute("data-target", "0");
            displayRing();
        }
    }
}

async function loadTodayHistory() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;
    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    try {
        const response = await fetch(`${WORKOUT_API_URL}/history?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to load history workout data.");

        const workoutHistory = await response.json();

        // --- CLEAN SEPARATION OF CONCERNS ---
        renderHistory(workoutHistory);
        setupHistoryModalToggle(workoutHistory);
    } catch (error) {
        console.error("Dashboard hydration error:", error);
    }
}

function renderHistory(workoutHistory) {
    const dailyHistoryList = document.getElementById("dailyHistoryList");
    const previewHistoryContainer = document.getElementById("previewHistoryList");

    if (!dailyHistoryList) return;

    dailyHistoryList.innerHTML = "";
    if (previewHistoryContainer) previewHistoryContainer.innerHTML = "";

    if (workoutHistory.length === 0) {
        dailyHistoryList.innerHTML = "<li>No workouts logged yet.</li>";
        return;
    }

    workoutHistory.forEach((workout, index) => {
        const displayString = formatWorkoutMetrics(workout);

        // 1. Append to the master scrollable layout list
        const mainLi = document.createElement("li");
        mainLi.innerHTML= displayString;
        dailyHistoryList.appendChild(mainLi);

        // 2. Append only the 2 most recent rows to the dashboard summary preview container cards
        if (previewHistoryContainer && index < 1) {
            const previewLi = document.createElement("li");
            previewLi.innerHTML = displayString;
            previewHistoryContainer.appendChild(previewLi);
        }
    });
}

function formatWorkoutMetrics(workout){
    const type = workout.exercise.workoutType ? workout.exercise.workoutType : "";
    const name = workout.exercise.name ? workout.exercise.name : "";
    const date = new Date(workout.date +"T00:00:00");
    const calories = workout.calories ? workout.calories : "";
    const reps = workout.reps ? workout.reps : "";
    const sets = workout.sets ? workout.sets : "";
    const intensity = workout.intensity ? workout.intensity : "";
    const weight = workout.weight ? workout.weight : "";
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",  // "Monday", "Tuesday"
        month: "short",   // "Jan", "Feb"
        day: "numeric",   // "1", "2"
        year: "numeric"   // "2026"
    });
    
    const headerRow = `
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
            <span>${formattedDate}</span>
            <span>${type}</span>
        </div>`;
        
    const statsRow = `
        <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.95rem;">
            <span>🔥 Calories Burned: ${calories ? `${calories}` : "N/A"} kcal</span>
            <span>⏱️ ${workout.duration} mins ${intensity ? `(${intensity})` : ""}</span>
        </div>`;

    switch (type) {
        case "Weightlifting":
            return `
                <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
                    ${headerRow}
                    ${statsRow}
                    <div style="margin-top: 6px; font-size: 0.9rem; color: #222; background: #f9f9f9; padding: 6px 10px; border-radius: 4px;">
                        <strong>Exercise:</strong> ${sets ? `${sets} x` : ""} ${name} ${weight ? `${weight}kg` : ""} ${reps ? `x ${reps}` : ""}
                    </div>
                </div>`;
            
        case "Running":
        case "Cycling":
        case "Swimming":
            const distanceStr = workout.distance ? ` 🏃 ${workout.distance} km` : "";
            return `
                <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
                    ${headerRow}
                    <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.95rem;">
                        <span>🔥 Calories Burned: ${calories} kcal</span>
                        <span>⏱️ ${workout.duration} mins |${distanceStr}</span>
                    </div>
                </div>`;
            
        default:
            return `
                <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
                    ${headerRow}
                    ${statsRow}
                </div>`;
    }
}

function setupHistoryModalToggle(history) {
    const seeMoreBtn = document.getElementById("seeMoreBtn");
    const historyModal = document.getElementById("historyModal");

    if (!seeMoreBtn || !historyModal || history.length === 0) return;

    // Remove any previous duplicate listeners before registering a new one
    seeMoreBtn.replaceWith(seeMoreBtn.cloneNode(true));
    document.getElementById("seeMoreBtn").addEventListener("click", () => {
        historyModal.classList.remove("hidden");
    });
}