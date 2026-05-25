
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

