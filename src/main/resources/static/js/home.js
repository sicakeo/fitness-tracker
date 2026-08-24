

import { checkAuth, logout } from "./auth.js";
import { 
    getMetValue, 
    getTargetCaloriesBurned, 
    calculateCaloriesBurned 
} from "./fitnessMath.js";

// ==========================================
// 1. CONSTANTS & GLOBAL STATE
// ==========================================
const WORKOUT_SESSION_API_URL = "http://localhost:8080/api/workout-sessions";
const EXERCISE_API_URL = "http://localhost:8080/api/exercises";
const FOOD_API_URL = "http://localhost:8080/api/food-entries";
let currentWorkoutEntries = []; // Staged workout items for active session

// ==========================================   
// 2. INITIALIZATION & LIFECYCLE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;
    setupNavigation();
    setupFormToggling();
    loadTodayCaloriesRing();
    loadTodayHistory();
});

function setupNavigation() {
    // Navigation button event listeners
    const startWorkoutBtn = document.getElementById("startWorkoutBtn");
    const closeExerciseModalBtn = document.getElementById("closeModalBtn");
    const workoutModal = document.getElementById("workoutModal");
    const closeHistoryBtn = document.getElementById("closeHistoryBtn");
    const historyModal = document.getElementById("historyModal");
    const closeFoodHistoryBtn = document.getElementById("closeFoodHistoryBtn");
    const foodHistoryModal = document.getElementById("foodHistoryModal");
    const foodForm = document.getElementById("foodForm");
    const exerciseModal = document.getElementById("exerciseModal");
    const addExerciseBtn = document.getElementById("addExerciseBtn");
    const seeMoreBtn = document.getElementById("seeMoreBtn");
    const seeMoreFoodBtn = document.getElementById("seeMoreFoodBtn");
    const cancelSessionBtn = document.getElementById("cancelSessionBtn");
    const saveSessionBtn = document.getElementById("saveSessionBtn");

    if (closeExerciseModalBtn) closeExerciseModalBtn.addEventListener("click", () => exerciseModal?.classList.add("hidden"));
    if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", () => historyModal?.classList.add("hidden"));
    if (closeFoodHistoryBtn) closeFoodHistoryBtn.addEventListener("click", () => foodHistoryModal?.classList.add("hidden"));
    if (foodForm) foodForm.addEventListener("submit", submitFoodEntry);
    if (addExerciseBtn) addExerciseBtn.addEventListener("click", () => exerciseModal?.classList.remove("hidden"));

    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener("click", () => {
            currentWorkoutEntries = [];
            renderExerciseList(document.getElementById("exerciseList"), currentWorkoutEntries);
            workoutModal?.classList.remove("hidden");
        });
    }

    if (cancelSessionBtn) {
        cancelSessionBtn.addEventListener("click", () => {
            currentWorkoutEntries = [];
            exerciseModal?.classList.add("hidden");
            workoutModal?.classList.add("hidden");
        });
    }

    if (saveSessionBtn) saveSessionBtn.addEventListener("click", submitWorkoutSession);

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener("click", () => {
            historyModal?.classList.remove("hidden");
        });
    }

    if (seeMoreFoodBtn) {
        seeMoreFoodBtn.addEventListener("click", () => {
            foodHistoryModal?.classList.remove("hidden");
        });
    }
}

function setupFormToggling() {
    const exerciseTypeSelect = document.getElementById("exerciseType");
    const exerciseForm = document.getElementById("exerciseForm");
    const exerciseModal = document.getElementById("exerciseModal");

    if (!exerciseTypeSelect) return;

    const fieldGroups = {
        distance:  document.getElementById("distanceGroup")  || document.querySelector(".form-group:nth-child(2)"),
        name:      document.getElementById("nameGroup")      || document.querySelector(".form-group:nth-child(3)"),
        reps:      document.getElementById("repsGroup")      || document.querySelector(".form-group:nth-child(4)"),
        sets:      document.getElementById("setsGroup")      || document.querySelector(".form-group:nth-child(5)"),
        weight:    document.getElementById("weightGroup")    || document.querySelector(".form-group:nth-child(6)"),
        intensity: document.getElementById("intensityGroup") || document.querySelector(".form-group:nth-child(7)"),
        duration:  document.getElementById("durationGroup")  || document.querySelector(".form-group:nth-child(8)"),
        date:      document.getElementById("dateGroup")      || document.querySelector(".form-group:nth-child(9)")
    };

    exerciseTypeSelect.addEventListener("change", () => {
        const selectedType = exerciseTypeSelect.value;

        Object.values(fieldGroups).forEach(group => { if (group) group.hidden = true; });
        if (fieldGroups.duration) fieldGroups.duration.hidden = false;
        if (fieldGroups.date) fieldGroups.date.hidden = false;

        if (["RUNNING", "CYCLING", "SWIMMING"].includes(selectedType)) {
            if (fieldGroups.distance) fieldGroups.distance.hidden = false;
        } else if (selectedType === "WEIGHTLIFTING") {
            ['name', 'reps', 'sets', 'weight', 'intensity'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].hidden = false; });
        } else if (selectedType === "HIIT") {
            if (fieldGroups.intensity) fieldGroups.intensity.hidden = false;
        }
    });

    if (exerciseForm) {
        exerciseForm.addEventListener("submit", (e) => {
            e.preventDefault();
            stageWorkoutEntry(exerciseTypeSelect.value, fieldGroups);
            if (exerciseModal) exerciseModal.classList.add("hidden");
            exerciseForm.reset();
        });
    }
}

// ==========================================
// 3. WORKOUT STAGING & MODAL UI
// ==========================================
function stageWorkoutEntry(selectedType, fieldGroups) {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;
    const userObj = JSON.parse(userSession);
    const userWeight = userObj.weight && userObj.weight > 0 ? parseFloat(userObj.weight) : 70.0;

    const elName = document.getElementById("name");
    const elIntensity = document.getElementById("intensity");
    const elDistance = document.getElementById("distance");
    const elReps = document.getElementById("reps");
    const elSets = document.getElementById("sets");
    const elWeight = document.getElementById("weight");
    const elDuration = document.getElementById("workoutDuration");

    const durationValue = elDuration ? parseInt(elDuration.value, 10) || 0 : 0;
    const distanceValue = elDistance ? parseFloat(elDistance.value) || 0 : 0;
    const inputName = (elName && fieldGroups.name && !fieldGroups.name.hidden) ? elName.value.trim() : selectedType;
    let intensityValue = elIntensity ? elIntensity.value : "MODERATE";
    intensityValue = calculateCardioIntensity(selectedType, distanceValue, durationValue, intensityValue);

    const met = getMetValue(selectedType, intensityValue);
    const calculatedCalories = Math.round(met * userWeight * (durationValue / 60));

    const entry = {
        exerciseName: inputName,
        exerciseType: selectedType,
        met: met,
        durationMinutes: durationValue,
        caloriesBurned: calculatedCalories,
        intensity: intensityValue,
        distanceKm: (fieldGroups.distance && !fieldGroups.distance.hidden) ? distanceValue : null,
        reps: (fieldGroups.reps && !fieldGroups.reps.hidden) ? parseInt(elReps.value, 10) || 0 : null,
        sets: (fieldGroups.sets && !fieldGroups.sets.hidden) ? parseInt(elSets.value, 10) || 0 : null,
        weight: (fieldGroups.weight && !fieldGroups.weight.hidden) ? parseFloat(elWeight.value) || 0 : null
    };

    currentWorkoutEntries.push(entry);
    const listElement = document.getElementById("exerciseList");
    renderExerciseList(listElement, currentWorkoutEntries);
}

function renderExerciseList(listElement, entries) {
    if (!listElement) return;

    listElement.innerHTML = "";
    if (entries.length === 0) {
        listElement.innerHTML = "<li style='color: #888;'>No exercises added to this session yet.</li>";
        return;
    }

    entries.forEach((entry, index) => {
        const li = document.createElement("li");
        li.style.cssText = "padding: 8px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;";
        li.innerHTML = `
            <div>
                <strong>${entry.exerciseName}</strong> (${entry.exerciseType})<br>
                <small>${entry.sets ? `${entry.sets} sets x ${entry.reps} reps | ` : ""}${entry.durationMinutes} mins | 🔥 ${entry.caloriesBurned} kcal</small>
            </div>
            <button type="button" style="background:#e74c3c;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;" 
                onclick="removeStagedExercise(${index})">✕</button>
        `;
        listElement.appendChild(li);
    });
}

window.removeStagedExercise = function(index) {
    currentWorkoutEntries.splice(index, 1);
    const listElement = document.getElementById("exerciseList");
    renderExerciseList(listElement, currentWorkoutEntries);
};

// ==========================================
// 4. API PERSISTENCE / FORM SUBMISSIONS
// ==========================================
async function submitFoodEntry(event) {
    event.preventDefault();
    const userSession = sessionStorage.getItem("user");
    if (!userSession) {
        alert("User session not found. Please log in again.");
        return;
    }

    const foodForm = document.getElementById("foodForm");
    if (foodForm && !foodForm.checkValidity()) {
        foodForm.reportValidity(); 
        return; 
    }

    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        const elMealType = document.getElementById("mealType");
        const elFoodName = document.getElementById("foodName");
        const elFoodCalories = document.getElementById("foodCalories");
        const elProtein = document.getElementById("protein");
        const elCarb = document.getElementById("carb");
        const elFat = document.getElementById("fat");   

        const caloriesValue = elFoodCalories ? parseInt(elFoodCalories.value) || 0 : 0;
        const proteinValue = elProtein ? parseFloat(elProtein.value) || 0 : 0;
        const carbValue = elCarb ? parseFloat(elCarb.value) || 0 : 0;
        const fatValue = elFat ? parseFloat(elFat.value) || 0 : 0;

        const foodEntryPayLoad = {
            user: { id: userId },
            mealType: elMealType ? elMealType.value.toUpperCase() : "BREAKFAST",
            name: elFoodName ? elFoodName.value.trim() : "Unknown Meal",
            calories: caloriesValue,
            protein: proteinValue,
            carb: carbValue,  
            fat: fatValue,   
            date: todayStr
        };

        const response = await fetch(FOOD_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(foodEntryPayLoad)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const serverErrorMessage = errorData.errors 
                ? Object.values(errorData.errors).join("\n") 
                : (errorData.message || "Failed to log meal entry validation rules.");
            throw new Error(serverErrorMessage);
        }

        alert("Meal logged successfully!");

        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            const existingCalories = parseInt(netDisplay.innerText) || 0;
            netDisplay.setAttribute("data-target", existingCalories + foodEntryPayLoad.calories);
        }

        displayRing();
        await loadTodayCaloriesRing();
        await loadTodayHistory();
    } catch (error) {
        console.error("Meal pipeline failure:", error);
        alert(error.message);
    }
}

async function submitWorkoutSession() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) {
        alert("User session not found. Please log in again.");
        return;
    }

    if (currentWorkoutEntries.length === 0) {
        alert("Please add at least one exercise before saving the session.");
        return;
    }

    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    const sessionTitle = document.getElementById("sessionTitle")?.innerText.trim() || "Workout Session";
    const sessionDate = document.getElementById("sessionDate")?.value || new Date().toISOString().split('T')[0];

    const totalCalories = currentWorkoutEntries.reduce((sum, item) => sum + item.caloriesBurned, 0);
    const totalDuration = currentWorkoutEntries.reduce((sum, item) => sum + item.durationMinutes, 0);

    try {
        const savedEntries = await Promise.all(currentWorkoutEntries.map(async (entry) => {
            const exercisePayload = {
                user: { id: userId },
                name: entry.exerciseName,
                workoutType: entry.workoutType,
                met: entry.met
            };

            const exResponse = await fetch(EXERCISE_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(exercisePayload)
            });

            if (!exResponse.ok) {
                const errData = await exResponse.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to create exercise entry.");
            }

            const savedEx = await exResponse.json();
            return {
                exercise: { id: savedEx.id },
                sets: entry.sets,
                reps: entry.reps,
                weight: entry.weight,
                durationMinutes: entry.durationMinutes,
                distanceKm: entry.distanceKm,
                intensity: entry.intensity
            };
        }));

        const sessionPayload = {
            user: { id: userId },
            title: sessionTitle,
            date: sessionDate,
            totalCaloriesBurned: totalCalories,
            totalDurationMinutes: totalDuration,
            entries: savedEntries
        };

        const sessionResponse = await fetch(WORKOUT_SESSION_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionPayload)
        });

        if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to save workout session.");
        }

        alert("Workout session saved successfully!");
        currentWorkoutEntries = [];
        document.getElementById("workoutModal")?.classList.add("hidden");

        displayRing();
        await loadTodayCaloriesRing();
        await loadTodayHistory();

    } catch (error) {
        console.error("Session saving failed:", error);
        alert(error.message);
    }
}

// ==========================================
// 5. DASHBOARD HYDRATION & ANIMATIONS
// ==========================================
async function loadTodayCaloriesRing() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;

    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        const userCaloriesInput = userObj.fitnessGoal ? Math.round(userObj.tdee - getTargetCaloriesBurned(userObj.fitnessGoal)) : 2000;
        const targetDisplay = document.getElementById("targetCaloriesDisplay");
        if (targetDisplay) {
            targetDisplay.textContent = userCaloriesInput;
            targetDisplay.setAttribute("data-target", userCaloriesInput);
        }

        const [workoutResponse, foodResponse] = await Promise.all([
            fetch(`${WORKOUT_SESSION_API_URL}/today-calories?userId=${userId}&date=${todayStr}`),
            fetch(`${FOOD_API_URL}/today-calories?userId=${userId}&date=${todayStr}`)
        ]);

        if (!workoutResponse.ok || !foodResponse.ok) throw new Error("Could not load current tracking metrics.");

        const totalBurned = await workoutResponse.json();
        const totalEaten = await foodResponse.json();

        const netCalories = totalEaten - totalBurned;
        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            netDisplay.setAttribute("data-target", netCalories);
            displayRing();
        }
    } catch (error) {
        console.error("Dashboard hydration error:", error);
        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            netDisplay.setAttribute("data-target", "0");
            displayRing();
        }
    }
}

function displayRing() {
    const netDisplay = document.getElementById("netCaloriesDisplay");
    const targetDisplay = document.getElementById("targetCaloriesDisplay");
    const circle = document.getElementById("calorieFillCircle");

    if (!netDisplay || !targetDisplay || !circle) return;

    const targetCalories = parseInt(targetDisplay.innerText) || 2000;
    const rawCalories = parseInt(netDisplay.getAttribute("data-target")) || 0;
    
    const finalCalories = Math.abs(rawCalories); 
    const isNegative = rawCalories < 0;

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    let currentCalories = 0;
    const duration = 2000; 
    const steps = 60;
    const stepTime = Math.max(duration / steps, 10);

    const interval = setInterval(() => {
        if (finalCalories <= 0 || currentCalories >= finalCalories) {
            netDisplay.innerText = rawCalories; 
            clearInterval(interval);
            return;
        }

        const incrementStep = Math.max(Math.ceil(finalCalories / 50), 1);
        currentCalories += incrementStep;
        if (currentCalories > finalCalories) currentCalories = finalCalories;

        netDisplay.innerText = isNegative ? -currentCalories : currentCalories;

        const percentage = currentCalories / targetCalories;
        
        if (isNegative) {
            circle.style.strokeDashoffset = circumference + (Math.min(percentage, 1) * circumference);
            circle.style.stroke = "#e74c3c";
        } else {
            circle.style.strokeDashoffset = circumference - (Math.min(percentage, 1) * circumference);
            circle.style.stroke = "#3498db";
        }
    }, stepTime);
}

// ==========================================
// 6. HISTORY RENDERING & METRIC FORMATTING
// ==========================================
async function loadTodayHistory() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;
    const userObj = JSON.parse(userSession);
    const userId = userObj.id;

    try {
        const [sessionsResponse, foodResponse] = await Promise.all([
            fetch(`${WORKOUT_SESSION_API_URL}/history?userId=${userId}`),
            fetch(`${FOOD_API_URL}/history?userId=${userId}`)
        ]);

        if (!sessionsResponse.ok || !foodResponse.ok) throw new Error("Could not synchronize activity log maps.");

        const workoutHistory = await sessionsResponse.json();
        const foodHistory = await foodResponse.json();

        renderHistory(workoutHistory);
        renderFoodHistory(foodHistory);
    } catch (error) {
        console.error("History logging pipeline crash:", error);
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

        const mainLi = document.createElement("li");
        mainLi.innerHTML = displayString;
        dailyHistoryList.appendChild(mainLi);

        if (previewHistoryContainer && index < 2) {
            const previewLi = document.createElement("li");
            previewLi.innerHTML = displayString;
            previewHistoryContainer.appendChild(previewLi);
        }
    });
}

function renderFoodHistory(foodHistory) {
    const fullFoodHistoryList = document.getElementById("fullFoodHistoryList");
    const previewFoodHistoryContainer = document.getElementById("previewFoodHistoryList");

    if (!fullFoodHistoryList) return;

    fullFoodHistoryList.innerHTML = "";
    if (previewFoodHistoryContainer) previewFoodHistoryContainer.innerHTML = "";

    if (foodHistory.length === 0) {
        const emptyLi = "<li style='text-align:center; color:#999; padding:10px;'>No meals logged yet.</li>";
        fullFoodHistoryList.innerHTML = emptyLi;
        if (previewFoodHistoryContainer) previewFoodHistoryContainer.innerHTML = emptyLi;
        return;
    }

    foodHistory.forEach((food, index) => {
        const displayHtml = formatFoodMetrics(food);

        const mainLi = document.createElement("li");
        mainLi.innerHTML = displayHtml;
        fullFoodHistoryList.appendChild(mainLi);

        if (previewFoodHistoryContainer && index < 2) {
            const previewLi = document.createElement("li");
            previewLi.innerHTML = displayHtml;
            previewFoodHistoryContainer.appendChild(previewLi);
        }
    });
}

function formatFoodMetrics(food) {
    const mealType = food.mealType || "Meal";
    const name = food.name || "Unknown Item";
    const calories = food.calories || 0;
    
    const p = food.protein ? Math.round(food.protein) : 0;
    const c = food.carbs ? Math.round(food.carbs) : (food.carb ? Math.round(food.carb) : 0);
    const f = food.fats ? Math.round(food.fats) : (food.fat ? Math.round(food.fat) : 0);

    const dateObj = new Date(food.date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return `
        <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
                <span style="font-size: 0.95rem; color: #333;">${formattedDate}</span>
                <span style="font-size: 0.95rem; color: #2ecc71;">${mealType}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.95rem; margin-bottom: 6px;">
                <span>🍏 Food Item: <strong>${name}</strong></span>
                <span style="font-weight: 600; color: #2ecc71;">+${calories} kcal</span>
            </div>

            <div style="display: flex; gap: 8px; font-size: 0.8rem; margin-top: 4px;">
                <span style="background: #eaf2f8; color: #2980b9; padding: 2px 8px; border-radius: 4px; font-weight: 600;">P: ${p}g</span>
                <span style="background: #fef5e7; color: #d35400; padding: 2px 8px; border-radius: 4px; font-weight: 600;">C: ${c}g</span>
                <span style="background: #e8f8f5; color: #27ae60; padding: 2px 8px; border-radius: 4px; font-weight: 600;">F: ${f}g</span>
            </div>
        </div>`;
}

function formatWorkoutMetrics(workout) {
    const title = workout.title || "Workout";
    const entries = workout.entries || [];
    const calories = workout.totalCaloriesBurned || 0;
    const date = new Date(workout.date);
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const exerciseList = document.createElement("ul");
    exerciseList.style.cssText = "list-style: none; padding: 10px; margin: 0;";

    for (const entry of entries) {
        entry.exerciseType = entry.exercise?.exerciseType || "Unknown Type";
        entry.exerciseType = entry.exerciseType.slice(0, 1).toUpperCase() + entry.exerciseType.slice(1).toLowerCase();
        entry.name = entry.exercise?.name || entry.exerciseType;
        entry.intensity = entry.intensity ? entry.intensity.slice(0, 1).toUpperCase() + entry.intensity.slice(1).toLowerCase() : "Moderate";
        
        const li = document.createElement("li");
        li.style.cssText = "padding: 8px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;";
        li.innerHTML = `
            <div>
                <strong>(${entry.exerciseType})</strong> ${entry.name === entry.exerciseType ? '' : entry.name}<br>
                ${formatExercise(entry.exerciseType, entry)}
            </div>`;
        exerciseList.appendChild(li);
    }

    const headerRow = `
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
            <span>${formattedDate}</span>
            <span>${title}</span>
        </div>`;

    return `
        <div style="padding: 12px 0; border-bottom: 1px solid #1c1a1a; width: 100%;">
            ${headerRow}
            ${exerciseList.outerHTML}
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px;">
                <span>Total Calories Burned:</span>
                <span style="color: #e74c3c;">🔥 ${calories} kcal</span>
            </div>
        </div>`;
}

function formatExercise(selectedType, entry) {
    switch (selectedType.toUpperCase()) {
        case "RUNNING":
        case "CYCLING":
        case "SWIMMING":
            return `${entry.distanceKm ?? 0} km in ${entry.durationMinutes} mins <br> <strong>Intensity:</strong> ${entry.intensity}`;
        case "WEIGHTLIFTING":
            return `${entry.sets ?? 0} sets x ${entry.reps ?? 0} reps at ${entry.weight ?? 0} kg <br> <strong>Intensity:</strong> ${entry.intensity}`;
        case "HIIT":
            return `${entry.durationMinutes} mins <br> <strong>Intensity:</strong> ${entry.intensity}`;
        default:
            return `Duration: ${entry.durationMinutes} mins <br> <strong>Intensity:</strong> ${entry.intensity}`;
    }
}
