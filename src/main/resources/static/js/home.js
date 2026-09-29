import { checkAuth } from "./auth/auth.js";
import { addWorkoutEntry, removeStagedExercise, getStagedWorkouts, clearStagedWorkouts } from './components/workoutManager.js';
import { renderExerciseList } from './components/ui.js';
import { getTargetCaloriesInput } from "./utils/fitnessMath.js";
import {
    saveFoodEntry,
    searchFoodDatabase,
    saveSingleExercise,
    saveWorkoutSession,
    searchExerciseDatabase,
    fetchDailyMetrics,      
    fetchUserHistory,       
    fetchTrendAnalytics    
} from "./services/api.js";

import { renderChart } from "./components/charts.js";
import { renderFoodSearch, renderExerciseSearch } from "./components/ui.js";
import { renderHistory, renderFoodHistory } from "./components/ui.js";
import { displayRing } from "./components/ring.js";

let searchTimeout = null; // For debouncing food search input
// ==========================================   
// 2. INITIALIZATION & LIFECYCLE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Check if the user is authenticated
    if (!checkAuth()) return;
    setupNavigation();
    setupFormToggling();
    setupFoodAutocomplete();
    setupExerciseAutocomplete();
    loadTodayCaloriesRing();
    loadTodayHistory();
    loadCalorieTrendChart();
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
    const editSessionBtn = document.getElementById("editSessionBtn");

    if (closeExerciseModalBtn) closeExerciseModalBtn.addEventListener("click", () => exerciseModal?.classList.add("hidden"));
    if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", () => historyModal?.classList.add("hidden"));
    if (closeFoodHistoryBtn) closeFoodHistoryBtn.addEventListener("click", () => foodHistoryModal?.classList.add("hidden"));
    if (foodForm) foodForm.addEventListener("submit", submitFoodEntry);
    if (addExerciseBtn) addExerciseBtn.addEventListener("click", () => exerciseModal?.classList.remove("hidden"));

    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener("click", () => {
            renderExerciseList(document.getElementById("exerciseList"), getStagedWorkouts());
            workoutModal?.classList.remove("hidden");
        });
    }

    if (cancelSessionBtn) {
        cancelSessionBtn.addEventListener("click", () => {
            clearStagedWorkouts();
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

    if (editSessionBtn) {
        editSessionBtn.addEventListener("click", () => {
            const sessionTitle = document.getElementById("sessionTitle");
            const sessionDescription = document.getElementById("sessionDescription");
            if(document.getElementById("titleInput")) 
                return; // Prevent multiple inputs
            const titleInput = document.createElement("input");
            sessionTitle.classList.add("hidden");
            editSessionBtn.classList.add("hidden");
            sessionDescription.classList.add("hidden");
            sessionTitle.parentNode.insertBefore(titleInput, sessionTitle.nextSibling);
            titleInput.type = "text";
            titleInput.value = sessionTitle.innerText;
            titleInput.id = "titleInput";
            titleInput.classList.add("text-primaryBlack", "font-medium");
            titleInput.style.fontSize = "1em";
            titleInput.addEventListener("blur", () => {
                sessionTitle.innerText = titleInput.value.trim() || "Workout Session";
                sessionTitle.classList.remove("hidden");
                sessionDescription.classList.remove("hidden");
                editSessionBtn.classList.remove("hidden");
                titleInput.remove();
            });
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

        Object.values(fieldGroups).forEach(group => { if (group) group.classList.add("hidden"); });
        if (fieldGroups.duration) fieldGroups.duration.classList.remove("hidden");
        if (fieldGroups.date) fieldGroups.date.classList.remove("hidden");

        // Map the new categories to the UI form displays
        if (selectedType === "HIIT_CARDIO") {
        if (fieldGroups.distance) fieldGroups.distance.classList.remove("hidden");
        if (fieldGroups.intensity) fieldGroups.intensity.classList.remove("hidden");
        if (fieldGroups.name) fieldGroups.name.classList.remove("hidden");
        } else if (selectedType === "CORE_STRENGTH") {
            ['name', 'reps', 'sets', 'weight', 'intensity'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].classList.remove("hidden"); });
        } else if (["MIND_BODY", "DANCE"].includes(selectedType)) {
            ['name', 'intensity'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].classList.remove("hidden"); });
        } else if (["CARDIO"].includes(selectedType)) {
            ['name', 'intensity', 'distance'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].classList.remove("hidden"); });
        } else if (selectedType === "OTHER") {
            ['name', 'intensity'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].classList.remove("hidden"); });
        }
    });

    if (exerciseForm) {
        exerciseForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const rawData = {
                selectedType: exerciseTypeSelect.value,
                inputName: document.getElementById("name").value.trim() || exerciseTypeSelect.value,
                intensityValue: document.getElementById("intensity").value || "MODERATE",
                distanceValue: parseFloat(document.getElementById("distance").value) || 0,
                repsValue: parseInt(document.getElementById("reps").value, 10) || 0,
                setsValue: parseInt(document.getElementById("sets").value, 10) || 0,
                weightValue: parseFloat(document.getElementById("weight").value) || 0,
                durationValue: parseInt(document.getElementById("workoutDuration").value, 10) || 0
            };
            
            const userWeight = JSON.parse(sessionStorage.getItem("user")).weight || 70.0;

            // Controller passes data to the pure Manager, then hands the result to the pure UI renderer
            const updatedEntries = addWorkoutEntry(rawData, userWeight);
            renderExerciseList(document.getElementById("exerciseList"), updatedEntries);
            
            if (exerciseModal) exerciseModal.classList.add("hidden");
            exerciseForm.reset();
        });
    }
}

function setupFoodAutocomplete() {
    const foodNameInput = document.getElementById("foodName");
    const autocompleteResults = document.getElementById("foodAutocompleteResults");

    if (!foodNameInput || !autocompleteResults) return;

    foodNameInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout); // Reset the timer on every keystroke
        const query = e.target.value.trim();

        if (query.length < 2) {
            autocompleteResults.innerHTML = "";
            autocompleteResults.classList.add("hidden");
            return;
        }

        searchTimeout = setTimeout(() => fetchFoodData(query), 400);
    });

    document.addEventListener("click", (e) => {
        if (!foodNameInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
            autocompleteResults.classList.add("hidden");
        }
    });
}

function setupExerciseAutocomplete() {
    const exerciseNameInput = document.getElementById("name");
    const autocompleteResults = document.getElementById("exerciseAutocompleteResults");
    exerciseNameInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout); 
        const query = e.target.value.trim();
        
        // Grab the currently selected category from the dropdown to filter the API
        const category = document.getElementById("exerciseType").value;

        if (query.length < 2 || !category) {
            autocompleteResults.innerHTML = "";
            autocompleteResults.classList.add("hidden");
            return;
        }

        searchTimeout = setTimeout(() => fetchExerciseData(query, category), 400);
    });

    document.addEventListener("click", (e) => {
        if (!exerciseNameInput.contains(e.target) && !autocompleteResults.contains(e.target)) { 
            autocompleteResults.classList.add("hidden");
        }
    });
        
}

window.removeStagedExercise = function(index) {
    const updatedEntries = removeStagedExercise(index);
    renderExerciseList(document.getElementById("exerciseList"), updatedEntries);
};


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
        userId: userId, 
        name: elFoodName ? elFoodName.value.trim() : "Unknown Meal",
        calories: caloriesValue,
        protein: proteinValue,
        carbs: carbValue,
        fat: fatValue,   
        date: todayStr,
        mealType: elMealType ? elMealType.value.toUpperCase() : "BREAKFAST",
    };

    try {
        await saveFoodEntry(foodEntryPayLoad);

        alert("Meal logged successfully!");

        const netDisplay = document.getElementById("netCaloriesDisplay");
        const circle = document.getElementById("calorieFillCircle");
        const targetDisplay = document.getElementById("targetCaloriesDisplay");
        if (netDisplay) {
            const existingCalories = parseInt(netDisplay.innerText) || 0;
            netDisplay.setAttribute("data-target", existingCalories + foodEntryPayLoad.calories);
        }

       
        displayRing(circle, netDisplay, targetDisplay);
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

    const stagedEntries = getStagedWorkouts();

    if (stagedEntries.length === 0) {
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
                userId: userId,
                name: entry.exerciseName,
                exerciseType: entry.exerciseType,
                met: entry.met
            };

            const savedEx = saveSingleExercise(exercisePayload);
            return {
                exerciseId: savedEx.id,
                exerciseName: entry.exerciseName,
                exerciseType: entry.exerciseType,
                sets: entry.sets,
                reps: entry.reps,
                weight: entry.weight,
                durationMinutes: entry.durationMinutes,
                distanceKm: entry.distanceKm,
                intensity: entry.intensity
            };
        }));

        const sessionPayload = {
            userId: userId,
            title: sessionTitle,
            date: sessionDate,
            totalCaloriesBurned: totalCalories,
            totalDurationMinutes: totalDuration,
            entries: savedEntries
        };
        await saveWorkoutSession(sessionPayload);

        alert("Workout session saved successfully!");
        currentWorkoutEntries = [];
        document.getElementById("workoutModal")?.classList.add("hidden");
        const netDisplay = document.getElementById("netCaloriesDisplay");
        const circle = document.getElementById("calorieFillCircle");
        const targetDisplay = document.getElementById("targetCaloriesDisplay");
        displayRing(circle, netDisplay, targetDisplay);
        await loadTodayCaloriesRing();
        await loadTodayHistory();

    } catch (error) {
        console.error("Session saving failed:", error);
        alert(error.message);
    }
}

async function fetchFoodData(query) {
    const autocompleteResults = document.getElementById("foodAutocompleteResults");
    try {
        // Show a temporary loading state
        autocompleteResults.innerHTML = "<li style='color:#777; text-align:center;'>Searching USDA database...</li>";
        autocompleteResults.classList.remove("hidden");
        const results = await searchFoodDatabase(query);
        renderFoodSearch(autocompleteResults, results);
    } catch (error) {
        console.error("USDA API Search Error:", error);
        autocompleteResults.innerHTML = "<li style='color:#e74c3c; text-align:center;'>Search failed. Try again.</li>";
    }
}

async function fetchExerciseData(query, category) {
    const autocompleteResults = document.getElementById("exerciseAutocompleteResults"); 
    try {
        autocompleteResults.innerHTML = "<li style='color:#777; text-align:center;'>Searching exercise database...</li>";
        autocompleteResults.classList.remove("hidden");

        const results = await searchExerciseDatabase(query, category);
        console.log("Exercise API Results:", results); // Debugging log
        renderExerciseSearch(autocompleteResults, results);
    } catch (error) {
        console.error("Exercise API Search Error:", error);
        autocompleteResults.innerHTML = "<li style='color:#e74c3c; text-align:center;'>Search failed. Try again.</li>";
    }
}

async function loadTodayHistory() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;
    const userId = JSON.parse(userSession).id;

    try {
        // 1. Controller asks API for data
        const { workoutHistory, foodHistory } = await fetchUserHistory(userId);
        
        // 2. Controller hands data to UI to render
        const dailyHistoryList = document.getElementById("dailyHistoryList");
        const previewHistoryContainer = document.getElementById("previewHistoryList");
        const fullFoodHistoryList = document.getElementById("fullFoodHistoryList");
        const previewFoodHistoryContainer = document.getElementById("previewFoodHistoryList");

        renderHistory(dailyHistoryList, previewHistoryContainer, workoutHistory);
        renderFoodHistory(fullFoodHistoryList, previewFoodHistoryContainer, foodHistory);
    } catch (error) {
        console.error("History logging pipeline crash:", error);
    }
}

async function loadCalorieTrendChart() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;
    const userId = JSON.parse(userSession).id;

    try {
        // 1. Ask API for data (assume you added fetchTrendAnalytics to api.js)
        const data = await fetchTrendAnalytics(userId);
        
        // 2. Controller maps data for the chart
        const chartCanvasElement = document.getElementById("calorieTrendChart");
        if (!chartCanvasElement) {
            console.error("Chart container not found");
            return;
        }
        const labels = data.map(day => new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { weekday: 'short', day: 'numeric' }));
        const eatenData = data.map(day => day.caloriesEaten);
        const burnedData = data.map(day => day.caloriesBurned);

        // 3. Hand to Chart component
        renderChart(chartCanvasElement, labels, eatenData, burnedData);
    } catch (error) {
        console.error("Chart Analytics Error:", error);
    }
}

async function loadTodayCaloriesRing() {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) return;
    
    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const netDisplay = document.getElementById("netCaloriesDisplay");
    const circle = document.getElementById("calorieFillCircle");

    try {
        // Handle Target Calories UI
        const userCaloriesInput = userObj.fitnessGoal ? Math.round(userObj.tdee + getTargetCaloriesInput(userObj.fitnessGoal)) : 2000;
        const targetDisplay = document.getElementById("targetCaloriesDisplay");
        if (targetDisplay) {
            targetDisplay.textContent = userCaloriesInput;
            targetDisplay.setAttribute("data-target", userCaloriesInput);
        }

        // Ask API for metrics
        const { totalBurned, totalEaten } = await fetchDailyMetrics(userId, todayStr);

        // Handle Net Calories UI
      
        if (netDisplay && circle) {
            netDisplay.setAttribute("data-target", totalEaten - totalBurned);
            displayRing(circle, netDisplay, targetDisplay);
        }
    } catch (error) {
        console.error("Dashboard hydration error:", error);
        const targetDisplay = document.getElementById("targetCaloriesDisplay");
        if (targetDisplay) {
            targetDisplay.textContent = "2000";
            targetDisplay.setAttribute("data-target", "2000");
        }
        const netDisplay = document.getElementById("netCaloriesDisplay");
        if (netDisplay) {
            netDisplay.setAttribute("data-target", "0");
            displayRing(circle, netDisplay, targetDisplay);
        }
    }
}