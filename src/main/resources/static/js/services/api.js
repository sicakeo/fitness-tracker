//==========================
// API Service Functions
//==========================

import { fetchWithAuth } from "../auth/auth.js";

const WORKOUT_SESSION_API_URL = "http://localhost:8080/api/workout-sessions";
const EXERCISE_API_URL = "http://localhost:8080/api/exercises";
const FOOD_API_URL = "http://localhost:8080/api/food-entries";
const FOOD_SEARCH_API_URL = "http://localhost:8080/api/food-search";
const EXERCISE_SEARCH_API_URL = "http://localhost:8080/api/exercise-search";
const ANALYTICS_API_URL = "http://localhost:8080/api/analytics";

/**
 * FOOD API
 */
export async function saveFoodEntry(foodPayload) {
    const response = await fetchWithAuth(FOOD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foodPayload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverErrorMessage = errorData.errors 
            ? Object.values(errorData.errors).join("\n") 
            : (errorData.message || "Failed to log meal entry.");
        throw new Error(serverErrorMessage);
    }
    return response.json();
}

export async function searchUSDAFoodDatabase(query) {
    const response = await fetchWithAuth(`${FOOD_SEARCH_API_URL}?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Food search failed");
    return response.json();
}

/**
 * WORKOUT & EXERCISE API
 */
export async function saveSingleExercise(exercisePayload) {
    const response = await fetchWithAuth(EXERCISE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exercisePayload)
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create exercise entry.");
    }
    return response.json();
}

export async function saveWorkoutSession(sessionPayload) {
    const response = await fetchWithAuth(WORKOUT_SESSION_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save workout session.");
    }
    return response.json();
}

export async function searchExerciseDatabase(query, category) {
    const url = `${EXERCISE_SEARCH_API_URL}?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error("Exercise search failed");
    return response.json();
}

export async function searchFoodDatabase(query) {   
    const url = `${FOOD_SEARCH_API_URL}?query=${encodeURIComponent(query)}`;
    const response = await fetchWithAuth(`${FOOD_SEARCH_API_URL}?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Food search failed");
    return response.json();
}
/**
 * ANALYTICS & DASHBOARD API
 */
export async function fetchDailyMetrics(userId, dateStr) {
    const [workoutResponse, foodResponse] = await Promise.all([
        fetchWithAuth(`${WORKOUT_SESSION_API_URL}/today-calories?userId=${userId}&date=${dateStr}`),
        fetchWithAuth(`${FOOD_API_URL}/today-calories?userId=${userId}&date=${dateStr}`)
    ]);

    if (!workoutResponse.ok || !foodResponse.ok) {
        throw new Error("Could not load current tracking metrics.");
    }

    return {
        totalBurned: await workoutResponse.json(),
        totalEaten: await foodResponse.json()
    };
}

export async function fetchUserHistory(userId) {
    const [sessionsResponse, foodResponse] = await Promise.all([
        fetchWithAuth(`${WORKOUT_SESSION_API_URL}/history?userId=${userId}`),
        fetchWithAuth(`${FOOD_API_URL}/history?userId=${userId}`)
    ]);

    if (!sessionsResponse.ok || !foodResponse.ok) {
        throw new Error("Could not synchronize activity log maps.");
    }

    return {
        workoutHistory: await sessionsResponse.json(),
        foodHistory: await foodResponse.json()
    };
}

export async function fetchTrendAnalytics(userId, days = 7) {
    const response = await fetchWithAuth(`${ANALYTICS_API_URL}/${days}-day-trend?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to load trend data");
    return response.json();
}