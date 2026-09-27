//==========================
// Workout Manager Module
//==========================

import { getMetValue, calculateCardioIntensity } from '../utils/fitnessMath.js';

let currentWorkoutEntries = []; 

export function getStagedWorkouts() {
    return currentWorkoutEntries;
}

export function clearStagedWorkouts() {
    currentWorkoutEntries = [];
}

// Takes a raw data object instead of reading the DOM
export function addWorkoutEntry(rawData, userWeight) {
    let intensityValue = calculateCardioIntensity(
        rawData.selectedType, 
        rawData.distanceValue, 
        rawData.durationValue, 
        rawData.intensityValue
    );

    const met = getMetValue(rawData.selectedType, intensityValue);
    let calculatedCalories = 0;

    // Time Under Tension Math
    if (rawData.selectedType === "CORE_STRENGTH" && rawData.setsValue > 0 && rawData.repsValue > 0) {
        const activeMinutes = (rawData.setsValue * rawData.repsValue * 4) / 60;
        const actualActiveMinutes = Math.min(activeMinutes, rawData.durationValue);
        const restingMinutes = Math.max(0, rawData.durationValue - actualActiveMinutes);
        
        const activeBurn = met * userWeight * (actualActiveMinutes / 60);
        const restingBurn = 1.5 * userWeight * (restingMinutes / 60);
        
        calculatedCalories = Math.round(activeBurn + restingBurn);
    } else {
        calculatedCalories = Math.round(met * userWeight * (rawData.durationValue / 60));
    }

    const entry = {
        exerciseName: rawData.inputName,
        exerciseType: rawData.selectedType,
        met: met,
        durationMinutes: rawData.durationValue,
        caloriesBurned: calculatedCalories,
        intensity: intensityValue,
        distanceKm: rawData.distanceValue,
        reps: rawData.repsValue,
        sets: rawData.setsValue,
        weight: rawData.weightValue
    };

    currentWorkoutEntries.push(entry);
    return currentWorkoutEntries; // Return the updated state
}

export function removeStagedExercise(index) {
    currentWorkoutEntries.splice(index, 1);
    return currentWorkoutEntries;
}