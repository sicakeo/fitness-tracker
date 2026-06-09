import { checkAuth, logout } from "./login.js"; 
const WORKOUT_API_URL =  "http://localhost:8080/api/workouts";
const EXERCISE_API_URL = "http://localhost:8080/api/exercises";

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;

    const signOutLink = document.getElementById("signOutLink");
    if (signOutLink) {
        signOutLink.addEventListener("click", logout);
    }

    const startWorkoutBtn = document.getElementById("startWorkoutBtn");
    const workoutForm = document.getElementById("workoutForm");
    const workoutModal = document.getElementById("workoutModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    

    const workoutTypeSelect = document.getElementById("workoutType");
    workoutTypeSelect.addEventListener("change", () => {
        const selectedType = workoutTypeSelect.value;
        const distanceGroup = document.querySelector(".form-group:nth-child(2)");
        const nameGroup = document.querySelector(".form-group:nth-child(3)");
        const repsGroup = document.querySelector(".form-group:nth-child(4)");
        const setsGroup = document.querySelector(".form-group:nth-child(5)");
        const weightGroup = document.querySelector(".form-group:nth-child(6)");
        const intensityGroup = document.querySelector(".form-group:nth-child(7)");
        const durationGroup = document.querySelector(".form-group:nth-child(8)");
        const workoutDateGroup = document.querySelector(".form-group:nth-child(9)");
       
       

        // Reset all fields
        distanceGroup.hidden = true;
        nameGroup.hidden = true;
        repsGroup.hidden = true;
        setsGroup.hidden = true;
        weightGroup.hidden = true;
        intensityGroup.hidden = true;
        durationGroup.hidden = false;
        workoutDateGroup.hidden = false; // Always show date

        if (selectedType === "Running" || selectedType === "Cycling" || selectedType === "Swimming") {
            distanceGroup.hidden = false;
        } else if (selectedType === "Weightlifting") {
            nameGroup.hidden = false;
            repsGroup.hidden = false;
            setsGroup.hidden = false;
            weightGroup.hidden = false;
            intensityGroup.hidden = false;
        } else if (selectedType === "HIIT") {
            durationGroup.hidden = false;
            intensityGroup.hidden = false;
        } else if (selectedType === "Yoga") {
            durationGroup.hidden = false;
        }
    });

    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener("click", () => {
            workoutModal.classList.remove("hidden");
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            workoutModal.classList.add("hidden");
        });
    }
    
    if (workoutForm) {
        workoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            workoutModal.classList.add("hidden");
            submitWorkout(document.getElementById("workoutType").value); // Pass the selected workout type to the submit function
        });
    }
});

async function submitWorkout(selectedType) {
    const userSession = sessionStorage.getItem("user");
    if (!userSession) {
        alert("User session not found. Please log in again.");
        
        return;
    }
    const userObj = JSON.parse(userSession);
    const userId = userObj.id;
    const userWeight = userObj.weight && userObj.weight > 0 ? parseFloat(userObj.weight) : 70.0;
    

    // Extract input string values safely
    const exerciseNameInput = document.getElementById("name") ? document.getElementById("name").value.trim() : "";
    let intensityInput = document.getElementById("intensity") ? document.getElementById("intensity").value : "Moderate";
    const distanceInput = document.getElementById("distance") ? document.getElementById("distance").value : "";
    const weightInput = document.getElementById("weight") ? document.getElementById("weight").value.trim() : "";
    const durationValue = parseInt(document.getElementById("workoutDuration").value) || 0;
    const dateValue = document.getElementById("workoutDate") ? document.getElementById("workoutDate").value : new Date().toISOString().split('T')[0];

    if (selectedType === "Running" && distanceInput && durationValue){
        const pace = distanceInput/(durationValue/60);
        pace >= 8 ? intensityInput = "Light" : pace >= 9.6 ? intensityInput = "Moderate" : intensityInput = "Heavy";
    }
    // 1. Get the accurate MET value using strings
    const met = getMetValue(selectedType, intensityInput);

    // 2. Calculate calories burned using your formula right here before saving
    const calculatedCalories = Math.round(met * userWeight * (durationValue / 60));
    console.log("Calories burned: ", calculatedCalories);
    // --- PHASE 1: BUILD & SAVE THE EXERCISE BLUEPRINT ---
    const exercisePayload = {
        user: {id: userId},
        name: exerciseNameInput || selectedType, // Fallback to parent type if name is hidden/blank
        workoutType: selectedType,
        met: met
    };

    try {
        console.log("Sending Exercise Payload:", exercisePayload);
        const exerciseResponse = await fetch(EXERCISE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(exercisePayload) // Clean flat object JSON translation
        });
        console.log(exercisePayload);

        if (!exerciseResponse.ok) throw new Error("Failed to register exercise blueprint configuration.");
        
        // Parse the response to extract the unique ID auto-assigned by MySQL
        const savedExercise = await exerciseResponse.json();
        const exerciseId = savedExercise.id;

        // --- PHASE 2: BUILD & SAVE THE USER WORKOUT INSTANCE ---
        const workoutPayload = {
            user: { id: userId }, // Maps perfectly to your backend @ManyToOne User association structure
            exercise: { id: exerciseId }, // Maps perfectly to your backend @ManyToOne Exercise association structure
            date: dateValue,
            duration: durationValue,
            calories: calculatedCalories, // Automatically includes your calculated metric energy data
            intensity: intensityInput,
            
            // Extract performance options safely (sends null to backend if field is hidden)
            distance: document.getElementById("distance") && !document.getElementById("distance").closest('.form-group').hidden ? parseFloat(document.getElementById("distance").value) : null,
            reps: document.getElementById("reps") && !document.getElementById("reps").closest('.form-group').hidden ? parseInt(document.getElementById("reps").value) : null,
            sets: document.getElementById("sets") && !document.getElementById("sets").closest('.form-group').hidden ? parseInt(document.getElementById("sets").value) : null,
            weight: document.getElementById("weight") && !document.getElementById("weight").closest('.form-group').hidden ? parseFloat(document.getElementById("weight").value) : null
        };

        console.log("Sending Workout Payload:", workoutPayload);
        const workoutResponse = await fetch(WORKOUT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(workoutPayload)
        });

        if (!workoutResponse.ok) throw new Error("Failed to record active workout history profile.");

        alert("Workout logged successfully!");
        
        // Dynamic Ring Refresh Step:
        // If you want your ring on the main dashboard to update immediately on submission, 
        // trigger your ring animation function here using the calculatedCalories!
        
        location.reload(); // Reload page to update your lists and sync views cleanly
        
    } catch (error) {
        console.error("Pipeline failure:", error);
        alert(error.message);
    }
}

const MET_MATRIX = {
    "Weightlifting": {
        "Light": 3.0,
        "Moderate": 3.5,
        "Heavy": 6.0
    },
    "Running": {
        "Light": 8.3,    // ~5 mph pace
        "Moderate": 9.8,  // ~6 mph pace
        "Heavy": 11.8    // ~7+ mph pace
    },
    "Cycling": {
        "Light": 5.8,
        "Moderate": 7.5,
        "Heavy": 10.0
    },
    "HIIT": {
        "Light": 5.0,
        "Moderate": 8.0,
        "Heavy": 11.0
    }
};

function getMetValue(workoutType, intensity) {
    // Return 0 or a safe fallback if the type or intensity doesn't exist
    if (!MET_MATRIX[workoutType] || !MET_MATRIX[workoutType][intensity]) {
        console.warn(`MET value not found for Type: ${workoutType}, Intensity: ${intensity}`);
        return 3.5; // Safe average fallback
    }
    
    return MET_MATRIX[workoutType][intensity];
}