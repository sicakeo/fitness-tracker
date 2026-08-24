// ==========================================
// FITNESS MATRICES & LOOKUP CONSTANTS
// ==========================================
export const MET_MATRIX = {
    "WEIGHTLIFTING": { "LIGHT": 3.0, "MODERATE": 3.5, "HEAVY": 6.0 },
    "RUNNING":       { "LIGHT": 8.3, "MODERATE": 9.8, "HEAVY": 11.8 },
    "CYCLING":       { "LIGHT": 5.8, "MODERATE": 7.5, "HEAVY": 10.0 },
    "HIIT":          { "LIGHT": 5.0, "MODERATE": 8.0, "HEAVY": 11.0 },
    "YOGA":          { "LIGHT": 2.5, "MODERATE": 2.5, "HEAVY": 2.5 }
};

export const TARGET_BURN_MATRIX = {
    "MILD_LOSS": 300,
    "WEIGHT_LOSS": 500,
    "MAINTAIN": 400,
    "WEIGHT_GAIN": 200,
    "HEAVY_GAIN": 150
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
    return MET_MATRIX[workoutType][intensity];
}

/**
 * Looks up the targeted calorie burn offset based on user fitness goal
 */
export function getTargetCaloriesBurned(goal) {
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
        if (selectedType === "RUNNING") {
            return paceKmh >= 11.3 ? "HEAVY" : paceKmh >= 9.6 ? "MODERATE" : "LIGHT";
        } else if (selectedType === "CYCLING") {
            return paceKmh >= 22.5 ? "HEAVY" : paceKmh >= 19.3 ? "MODERATE" : "LIGHT";
        } else if (selectedType === "SWIMMING") {
            return paceKmh >= 3.0 ? "HEAVY" : paceKmh >= 2.0 ? "MODERATE" : "LIGHT";
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