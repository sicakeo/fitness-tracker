//==========================
// UI Rendering Functions
//==========================

import { formatWorkoutMetrics, formatFoodMetrics } from "../utils/formatter.js";

export function renderHistory(dailyHistoryList, previewHistoryContainer, workoutHistory) {
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

export function renderFoodHistory(fullFoodHistoryList, previewFoodHistoryContainer, foodHistory) {
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

export function renderFoodSearch(autocompleteResults, results) {
    if (!autocompleteResults) return;

    if (results.length === 0) {
        autocompleteResults.innerHTML = "<li style='color:#777; text-align:center;'>No foods found</li>";
        return;
    }

    autocompleteResults.innerHTML = "";
    
    results.forEach(food => {
        const li = document.createElement("li");
        food.description = food.description.charAt(0).toUpperCase() + food.description.slice(1).toLowerCase();
        li.innerHTML = `
            <strong>${food.description}</strong>
            <small>${Math.round(food.calories)} kcal | P: ${food.protein.toFixed(1)}g | C: ${food.carbs.toFixed(1)}g | F: ${food.fat.toFixed(1)}g</small>
        `;
        
        // When a user clicks a list item, autofill the entire food form
        li.addEventListener("click", () => {
            document.getElementById("foodName").value = food.description;
            document.getElementById("foodCalories").value = Math.round(food.calories);
            document.getElementById("protein").value = food.protein.toFixed(1);
            document.getElementById("carb").value = food.carbs.toFixed(1);
            document.getElementById("fat").value = food.fat.toFixed(1);
            
            autocompleteResults.classList.add("hidden"); // Hide the dropdown
        });
    
        autocompleteResults.appendChild(li);
    });
}

export function renderExerciseSearch(autocompleteResults, results) {
    if (!autocompleteResults) return;

    if (results.length === 0) {
        autocompleteResults.innerHTML = "<li style='color:#777; text-align:center;'>No exercises found</li>";
        return;
    }

    autocompleteResults.innerHTML = "";
    
   results.forEach(exercise => {
        const li = document.createElement("li");
        // FIX 2: Map exercise data (Name, Type, MET) instead of Food Macros
        li.innerHTML = `
            <strong>${exercise.name}</strong>
            <small>${exercise.type}</small>
        `;
        
        // When a user clicks a list item, auto-fill the entire exercise form
        li.addEventListener("click", () => {
            document.getElementById("name").value = exercise.name;
            autocompleteResults.classList.add("hidden"); 
        });

        li.addEventListener("mouseover", () => {
            li.style.backgroundColor = "#f0f0f0";
        });

        li.addEventListener("mouseout", () => {
            li.style.backgroundColor = "";
        });
        autocompleteResults.appendChild(li);
    });

    // Close the dropdown if the user clicks anywhere else on the screen
    document.addEventListener("click", (e) => {
        if (!document.getElementById("name").contains(e.target) && !autocompleteResults.contains(e.target)) {
            autocompleteResults.classList.add("hidden");
        }
    });
}

export function renderExerciseList(listElement, entries) {
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