import { checkAuth, logout } from "./login.js"; 

document.addEventListener("DOMContentLoaded", () => {
    /*if (!checkAuth()) return;

    const signOutLink = document.getElementById("signOutLink");
    if (signOutLink) {
        signOutLink.addEventListener("click", logout);
    }*/

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
        const durationGroup = document.querySelector(".form-group:nth-child(7)");
        const caloriesGroup = document.querySelector(".form-group:nth-child(8)");
        const workoutDateGroup = document.querySelector(".form-group:nth-child(9)");
        
       

        // Reset all fields
        distanceGroup.hidden = true;
        nameGroup.hidden = true;
        repsGroup.hidden = true;
        caloriesGroup.hidden = true;
        setsGroup.hidden = true;
        durationGroup.hidden = true;
        weightGroup.hidden = true;

        if (selectedType === "Running" || selectedType === "Cycling" || selectedType === "Swimming") {
            distanceGroup.hidden = false;
            durationGroup.hidden = false;
        } else if (selectedType === "Weightlifting") {
            nameGroup.hidden = false;
            repsGroup.hidden = false;å
            setsGroup.hidden = false;
            weightGroup.hidden = false;
        } else if (selectedType === "HIIT") {
            durationGroup.hidden = false;
            caloriesGroup.hidden = false;
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
            // Here you would typically send the workout data to the server
            alert("Workout started! (This is a placeholder action)");
            workoutModal.classList.add("hidden");
        });
    }
});

function submitWorkout(selectedType) {
    // Collect workout data based on selectedType
    const workoutData = {
        type: selectedType,
        distance: document.getElementById("distance").value,
        name: document.getElementById("name").value,
        reps: document.getElementById("reps").value,
        calories: document.getElementById("workoutCalories").value,
        sets: document.getElementById("sets").value,
        duration: document.getElementById("workoutDuration").value,
        weight: document.getElementById("weight").value,
        date: document.getElementById("workoutDate").value
    };

    // Send workoutData to the server (this is a placeholder)
    console.log("Submitting workout:", workoutData);
    alert("Workout submitted! (This is a placeholder action)");

}

