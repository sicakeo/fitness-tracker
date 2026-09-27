//==========================
// Formatter Utility Functions
//==========================

export function formatFoodMetrics(food) {
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

export function formatWorkoutMetrics(workout) {
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
        console.log("Entry details:", entry);
       
        // Capitalize the first letter of each word in exerciseName and exerciseType for better display
        entry.exerciseName = entry.exerciseName.split(/[\s,,_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        if (entry.exerciseType !== 'Other') {
            entry.exerciseType = entry.exerciseType.split(/[\s,,_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        }
        entry.intensity = entry.intensity ? entry.intensity.slice(0, 1).toUpperCase() + entry.intensity.slice(1).toLowerCase() : "Moderate";
        
        const li = document.createElement("li");
        li.style.cssText = "padding: 8px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: left;";
        li.innerHTML = `
            <div>
                <strong> ${entry.exerciseType !== 'Other' ? `(${entry.exerciseType})` : ''}</strong> ${entry.exerciseName === entry.exerciseType ? '' : entry.exerciseName}
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

export function formatExercise(selectedType, entry) {
    switch (selectedType.toUpperCase()) {
        case "RUNNING":
        case "CYCLING":
        case "SWIMMING":
            return `${entry.distanceKm ?? 0} km in ${entry.durationMinutes} mins <br> <strong>Intensity:</strong> ${entry.intensity}`;
        case "WEIGHTLIFTING":
            return `<br>${entry.sets ?? 0} sets x ${entry.reps ?? 0} reps at ${entry.weight ?? 0} kg <br> <strong>Intensity:</strong> ${entry.intensity}`;
        case "HIIT":
            return `<br>${entry.durationMinutes} mins <br> <strong>Intensity:</strong> ${entry.intensity}`;
        default:
            return `<br>Duration: ${entry.durationMinutes} mins <br> <strong>Intensity:</strong> ${entry.intensity}`;
    }
}