
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