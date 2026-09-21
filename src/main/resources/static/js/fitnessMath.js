// ==========================================
// FITNESS MATRICES & LOOKUP CONSTANTS
// ==========================================
export const MET_MATRIX = {
    "CORE_STRENGTH": { "LIGHT": 3.0, "MODERATE": 4.5, "HEAVY": 6.0 },
    "HIIT_CARDIO":   { "LIGHT": 6.0, "MODERATE": 8.5, "HEAVY": 11.5 },
    "MIND_BODY":     { "LIGHT": 2.5, "MODERATE": 3.0, "HEAVY": 4.0 },
    "DANCE":         { "LIGHT": 3.0, "MODERATE": 5.0, "HEAVY": 7.0 },
    "OTHER":         { "LIGHT": 3.0, "MODERATE": 5.0, "HEAVY": 7.0 }
};

export const TARGET_BURN_MATRIX = {
    "MILD_LOSS": -300,
    "WEIGHT_LOSS": -500,
    "MAINTAIN": 0,
    "WEIGHT_GAIN": 400,
    "HEAVY_GAIN": 600
};

// ==========================================
// CALCULATION & MATRIX HELPERS
// ==========================================

/**
 * Safely looks up the MET value for a workout type and intensity
 */
export function getMetValue(workoutType, intensity) {
    if (!MET_MATRIX[workoutType] || !MET_MATRIX[workoutType][intensity]) {
        console.warn(`MET value not found for Type: ${workoutType}, Intensity: ${intensity}`);
        return 3.5;
    }
    // Extract the numerical value from the new object structure
    return MET_MATRIX[workoutType][intensity].met;
}

/**
 * Looks up the targeted calorie input based on user fitness goal
 */
export function getTargetCaloriesInput(goal) {
    if (!goal || !TARGET_BURN_MATRIX[goal.trim()]) {
        console.warn(`Target Burned Calories not found for Goal: ${goal}`);
        return 0;
    }
    return TARGET_BURN_MATRIX[goal.trim()];
}

/**
 * Determines cardio intensity based on velocity (km/h)
 */
export function calculateCardioIntensity(selectedType, distanceKm, durationMinutes, fallback = "MODERATE") {
    if (distanceKm > 0 && durationMinutes > 0) {
        const paceKmh = distanceKm / (durationMinutes / 60);
        if (selectedType === "HIIT_CARDIO") {
            return paceKmh >= 11.3 ? "HEAVY" : paceKmh >= 9.6 ? "MODERATE" : "LIGHT";
        } 
    }
    return fallback;
}

/**
 * Calculates total calories burned using MET formula: MET * weight (kg) * (duration / 60)
 */
export function calculateCaloriesBurned(met, weightKg, durationMinutes) {
    return Math.round(met * weightKg * (durationMinutes / 60));
}
export function calculateBMI(unitSelect, weight, height){
    let bmi;
    if (unitSelect === "standard") {
        if (height > 0) {
            return (weight / Math.pow(height, 2)) * 703;
        }
    } else {
        const heightInMeters = height / 100.0;
        if (heightInMeters > 0) {
            return weight / Math.pow(heightInMeters, 2);
        }
    }
    return 0;
}

export function calculateBMR(unitSelect, weight, height, age, gender){
    let bmr;
    if (unitSelect === "standard") {
        // Convert weight from lbs to kg and height from inches to cm for BMR calculation
        weight = weight / 2.20462; // Convert lbs to kg
        height = height * 2.54; // Convert inches to cm
    } 
    return 10 * weight + 6.25 * height - 5 * age + (gender === "M" ? 5 : -161);  
}

export function calculateTDEE(bmr, activityLevel){
    if (activityLevel) return bmr * activityLevel;
    return bmr;
}


export function getReadableGoalText(goalValue) {
    const goalMap = {
        "MILD_LOSS": "Mild Weight Loss (~0.25 kg/week)",
        "WEIGHT_LOSS": "Weight Loss (~0.5 kg/week)",
        "MAINTAIN": "Maintain Current Weight",
        "WEIGHT_GAIN": "Muscle Building / Weight Gain (~0.25 kg/week)",
        "HEAVY_GAIN": "Aggressive Weight Gain (~0.5 kg/week)"
    };
    
    return goalMap[goalValue] || "";
}

export function getReadableActivityLevelText(activityLevelValue) {
    const activityLevelMap = {
        "1.2": "Sedentary (little or no exercise)",
        "1.375": "Lightly Active (light exercise/sports 1-3 days/week)",
        "1.55": "Moderately Active (moderate exercise/sports 3-5 days/week)",
        "1.725": "Very Active (hard exercise/sports 6-7 days a week)",
        "1.9": "Extra Active (very hard exercise/sports & physical job or 2x training)"
    };
    
    return activityLevelMap[activityLevelValue] || "";
}