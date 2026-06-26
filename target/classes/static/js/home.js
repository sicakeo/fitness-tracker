    import { checkAuth, logout } from "./login.js";

    const WORKOUT_API_URL = "http://localhost:8080/api/workouts";
    const EXERCISE_API_URL = "http://localhost:8080/api/exercises";
    const FOOD_API_URL = "http://localhost:8080/api/food-entries";

    // Constant Metric Lookups declared outside loops to optimize heap memory reuse
    const MET_MATRIX = {
        "Weightlifting": { "Light": 3.0, "Moderate": 3.5, "Heavy": 6.0 },
        "Running":       { "Light": 8.3, "Moderate": 9.8, "Heavy": 11.8 },
        "Cycling":       { "Light": 5.8, "Moderate": 7.5, "Heavy": 10.0 },
        "HIIT":          { "Light": 5.0, "Moderate": 8.0, "Heavy": 11.0 },
        "Yoga":          { "Light": 2.5, "Moderate": 2.5, "Heavy": 2.5 }
    };

    const TARGET_BURN_MATRIX = {
        "MILD_LOSS": 300,  // Burn 300 kcal from exercise
        "WEIGHT_LOSS": 500,  // Burn 500 kcal from exercise (Standard deficit)
        "MAINTAIN": 400,  // Burn 400 kcal from exercise just for heart health
        "WEIGHT_GAIN": 200,  // Burn less exercise calories to help gain weight
        "HEAVY_GAIN": 150   // Minimize cardio burn to maximize muscle mass
    };
    document.addEventListener("DOMContentLoaded", () => {
        //if (!checkAuth()) return;
        setupNavigation();
        setupFormToggling();
        loadTodayCaloriesRing()
        loadTodayHistory()
    });

    /**
     * Handles basic navbar event wireframes
     */
    function setupNavigation() {
        const signOutLink = document.getElementById("signOutLink");
        if (signOutLink) signOutLink.addEventListener("click", logout);

        const startWorkoutBtn = document.getElementById("startWorkoutBtn");
        const closeModalBtn = document.getElementById("closeModalBtn");
        const workoutModal = document.getElementById("workoutModal");
        const closeHistoryBtn = document.getElementById("closeHistoryBtn");
        const historyModal = document.getElementById("historyModal");
        const foodForm = document.getElementById("foodForm");

        if (startWorkoutBtn) startWorkoutBtn.addEventListener("click", () => workoutModal.classList.remove("hidden"));
        if (closeModalBtn) closeModalBtn.addEventListener("click", () => workoutModal.classList.add("hidden"));
        if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", () => historyModal.classList.add("hidden"));
        if (foodForm) foodForm.addEventListener("submit", submitFoodEntry);
    }

    /**
     * Orchestrates form group visibility toggle maps based on workout categories
     */
    function setupFormToggling() {
        const workoutTypeSelect = document.getElementById("workoutType");
        const workoutForm = document.getElementById("workoutForm");
        const workoutModal = document.getElementById("workoutModal");

        if (!workoutTypeSelect) return;

        // Mapping strategy: Clean, maintainable, and descriptive dictionary routing paths
        const fieldGroups = {
            distance: document.getElementById("distanceGroup") || document.querySelector(".form-group:nth-child(2)"),
            name:     document.getElementById("nameGroup")     || document.querySelector(".form-group:nth-child(3)"),
            reps:     document.getElementById("repsGroup")     || document.querySelector(".form-group:nth-child(4)"),
            sets:     document.getElementById("setsGroup")     || document.querySelector(".form-group:nth-child(5)"),
            weight:   document.getElementById("weightGroup")   || document.querySelector(".form-group:nth-child(6)"),
            intensity:document.getElementById("intensityGroup")|| document.querySelector(".form-group:nth-child(7)"),
            duration: document.getElementById("durationGroup") || document.querySelector(".form-group:nth-child(8)"),
            date:     document.getElementById("dateGroup")     || document.querySelector(".form-group:nth-child(9)")
        };

        workoutTypeSelect.addEventListener("change", () => {
            const selectedType = workoutTypeSelect.value;

            // Reset state configuration layers defaults cleanly
            Object.values(fieldGroups).forEach(group => { if (group) group.hidden = true; });
            if (fieldGroups.duration) fieldGroups.duration.hidden = false;
            if (fieldGroups.date) fieldGroups.date.hidden = false;

            // Toggle rulesets
            if (["Running", "Cycling", "Swimming"].includes(selectedType)) {
                if (fieldGroups.distance) fieldGroups.distance.hidden = false;
            } else if (selectedType === "Weightlifting") {
                ['name', 'reps', 'sets', 'weight', 'intensity'].forEach(k => { if (fieldGroups[k]) fieldGroups[k].hidden = false; });
            } else if (selectedType === "HIIT") {
                if (fieldGroups.intensity) fieldGroups.intensity.hidden = false;
            }
        });

        if (workoutForm) {
            workoutForm.addEventListener("submit", (e) => {
                e.preventDefault();
                if (workoutModal) workoutModal.classList.add("hidden");
                submitWorkout(workoutTypeSelect.value, fieldGroups);
            });
        }
    }

    /**
     * Handles dual-stage API pipeline relational persistence transactions
     */
    async function submitWorkout(selectedType, fieldGroups) {
        const userSession = sessionStorage.getItem("user");
        if (!userSession) {
            alert("User session not found. Please log in again.");
            return;
        }

        const userObj = JSON.parse(userSession);
        const userId = userObj.id;
        const userWeight = userObj.weight && userObj.weight > 0 ? parseFloat(userObj.weight) : 70.0;

        // Extract DOM values cleanly into descriptive local references
        const elName = document.getElementById("name");
        const elIntensity = document.getElementById("intensity");
        const elDistance = document.getElementById("distance");
        const elReps = document.getElementById("reps");
        const elSets = document.getElementById("sets");
        const elWeight = document.getElementById("weight");
        const elDuration = document.getElementById("workoutDuration");
        const elDate = document.getElementById("workoutDate");

        const durationValue = elDuration ? parseInt(elDuration.value) || 0 : 0;
        const dateValue = elDate && elDate.value ? elDate.value : new Date().toISOString().split('T')[0];
        const distanceValue = elDistance ? parseFloat(elDistance.value) || 0 : 0;
        const inputName = (elName && !fieldGroups.name.hidden ? elName.value.trim() : "");
        let intensityValue = elIntensity ? elIntensity.value : "Moderate";

        // FIXED: Safe pace parsing order of operation constraints (highest benchmark evaluated first)
        // --- AUTOMATIC INTENSITY CALCULATOR BASED ON VELOCITY ---
        if (distanceValue > 0 && durationValue > 0) {
            // Calculate velocity in kilometers per hour (km/h)
            const paceKmh = distanceValue / (durationValue / 60);

            switch (selectedType) {
                case "Running":
                    if (paceKmh >= 11.3) {
                        intensityValue = "Heavy";      // ~7+ mph pace
                    } else if (paceKmh >= 9.6) {
                        intensityValue = "Moderate";   // ~6 mph pace
                    } else {
                        intensityValue = "Light";      // ~5 mph or slower
                    }
                    break;

                case "Cycling":
                    if (paceKmh >= 22.5) {
                        intensityValue = "Heavy";      // Strenuous fitness/racing
                    } else if (paceKmh >= 19.3) {
                        intensityValue = "Moderate";   // Steady moderate effort
                    } else {
                        intensityValue = "Light";      // Leisurely pace
                    }
                    break;

                case "Swimming":
                    if (paceKmh >= 3.0) {
                        intensityValue = "Heavy";      // Fast interval training laps
                    } else if (paceKmh >= 2.0) {
                        intensityValue = "Moderate";   // Continuous lap swimming
                    } else {
                        intensityValue = "Light";      // Casual/relaxing pacing
                    }
                    break;

                default:
                    // Fall back to the manual dropdown select choice if it's not a distance sport
                    break;
            }
            console.log(`Calculated metric velocity for ${selectedType}: ${paceKmh.toFixed(2)} km/h. Intensity assigned: ${intensityValue}`);
        }

        const met = getMetValue(selectedType, intensityValue);
        const calculatedCalories = Math.round(met * userWeight * (durationValue / 60));
        const element = document.getElementById("netCaloriesDisplay");
        if(element) element.setAttribute("data-target", calculatedCalories);
        console.log("element", element.getAttribute("data-target"));
    
        // Phase 1 Payload Mapping
        const exercisePayload = {
            user: { id: userId },
            name:   inputName || selectedType,
            workoutType: selectedType,
            met: met
        };

        try {
            // --- PHASE 1: CHRONOLOGICAL EXERCISE LOG ---
            const exerciseResponse = await fetch(EXERCISE_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(exercisePayload)
            });

            if (!exerciseResponse.ok) throw new Error("Failed to register exercise blueprint configuration.");
            const savedExercise = await exerciseResponse.json();

            // Phase 2 Payload Mapping: Conditional validation reads clean cache variables
            const workoutPayload = {
                user: { id: userId },
                exercise: { id: savedExercise.id },
                date: dateValue,
                duration: durationValue,
                calories: calculatedCalories,
                intensity: intensityValue,
                distance: fieldGroups.distance && !fieldGroups.distance.hidden ? distanceValue : null,
                reps: fieldGroups.reps && !fieldGroups.reps.hidden ? parseInt(elReps.value) || 0 : null,
                sets: fieldGroups.sets && !fieldGroups.sets.hidden ? parseInt(elSets.value) || 0 : null,
                weight: fieldGroups.weight && !fieldGroups.weight.hidden ? parseFloat(elWeight.value) || 0 : null
            };

            // --- PHASE 2: DEPENDENT WORKOUT ENTRY PERPETUATION ---
            const workoutResponse = await fetch(WORKOUT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(workoutPayload)
            });

            if (!workoutResponse.ok) throw new Error("Failed to record active workout history profile.");
            const netDisplay = document.getElementById("netCaloriesDisplay");
            if (netDisplay) {
                // Grab the current visible calories on screen (e.g., if they already had 200 kcal logged today)
                const existingCalories = parseInt(netDisplay.innerText) || 0;
                const updatedTotalTarget = existingCalories - calculatedCalories;

                // Update the data-target data boundary attribute link directly
                netDisplay.setAttribute("data-target", updatedTotalTarget);
            }

            // --- TRIGGER ANIMATION LAYER WITHOUT RESETTING PAGE ---
            displayRing();

        } catch (error) {
            console.error("Pipeline failure:", error);
            alert(error.message);
        }
    }

    /**
     * Safely aggregates multidimensional array maps using fallback boundaries
     */
    function getMetValue(workoutType, intensity) {
        if (!MET_MATRIX[workoutType] || !MET_MATRIX[workoutType][intensity]) {
            console.warn(`MET value not found for Type: ${workoutType}, Intensity: ${intensity}`);
            return 3.5;
        }
        return MET_MATRIX[workoutType][intensity];
    }

    function getTargetCaloriesBurned(goal){
        if(!TARGET_BURN_MATRIX[goal.trim()]){
            console.warn(`Target Burned Calories not found for Goal: ${goal}`);
            return 0;
        }
        return TARGET_BURN_MATRIX[goal];
    }


    function displayRing() {
        const netDisplay = document.getElementById("netCaloriesDisplay");
        const targetDisplay = document.getElementById("targetCaloriesDisplay");
        const circle = document.getElementById("calorieFillCircle");

        const targetCalories = parseInt(targetDisplay.innerText) || 2000;
        const rawCalories = parseInt(netDisplay.getAttribute("data-target")) || 0;
        
        const finalCalories = Math.abs(rawCalories); 
        const isNegative = rawCalories < 0;

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        let currentCalories = 0;
        const duration = 2000; 
        const steps = 60;
        const stepTime = Math.max(duration / steps, 10);

        const interval = setInterval(() => {
            if (finalCalories <= 0 || currentCalories >= finalCalories) {
                // Display the true signed value (positive or negative) in the text center
                netDisplay.innerText = rawCalories; 
                clearInterval(interval);
                return;
            }

            const incrementStep = Math.max(Math.ceil(finalCalories / 50), 1);
            currentCalories += incrementStep;
            if (currentCalories > finalCalories) currentCalories = finalCalories;

            // Display progress text matching sign
            netDisplay.innerText = isNegative ? -currentCalories : currentCalories;

            // Calculate percentage using the absolute positive scale value
            const percentage = currentCalories / targetCalories;
            
            if (isNegative) {
                // 🚴‍♂️ OPTION A: Animate COUNTER-CLOCKWISE for deficits
                circle.style.strokeDashoffset = circumference + (Math.min(percentage, 1) * circumference);
                circle.style.stroke = "#e74c3c";// Change to blue to flag a calorie deficit
            } else {
                // 🍎 OPTION B: Animate CLOCKWISE for normal accumulation
                circle.style.strokeDashoffset = circumference - (Math.min(percentage, 1) * circumference);
                circle.style.stroke = "#3498db";  // Your standard active color
            }
        }, stepTime);
    }


    /**
     * Fetches total daily logged calories from backend and animates the progress ring
     */
    async function loadTodayCaloriesRing() {
        const userSession = sessionStorage.getItem("user");
        if (!userSession) return;

        const userObj = JSON.parse(userSession);
        const userId = userObj.id;
        // Generate current local system date in exact YYYY-MM-DD format
        const todayStr = new Date().toISOString().split('T')[0];

        try {

            const userCaloriesInput = Math.round(userObj.tdee - getTargetCaloriesBurned(userObj.fitnessGoal));
            document.getElementById("targetCaloriesDisplay").textContent = userCaloriesInput;
            document.getElementById("targetCaloriesDisplay").setAttribute("data-target", userCaloriesInput);
            // Fetch only the compiled integer sum directly from the endpoint
            const [workoutResponse, foodResponse] = await Promise.all([
                fetch(`${WORKOUT_API_URL}/today-calories?userId=${userId}&date=${todayStr}`),
                fetch(`${FOOD_API_URL}/today-calories?userId=${userId}&date=${todayStr}`)
            ]);

            if (!workoutResponse.ok || !foodResponse.ok) throw new Error("Failed to sync metrics.");

            const totalBurned = await workoutResponse.json();
            const totalEaten = await foodResponse.json();

            // Net math calculations
            const netCalories = totalEaten - totalBurned;
            const netDisplay = document.getElementById("netCaloriesDisplay");
            if (netDisplay) {
                // Set the target attribute link that displayRing reads from
                netDisplay.setAttribute("data-target", netCalories);

                // Run your engine cleanly!
                displayRing();
            }
        } catch (error) {
            console.error("Dashboard hydration error:", error);

            // Quiet fallback so the UI doesn't visually hang on network lag
            const netDisplay = document.getElementById("netCaloriesDisplay");
            if (netDisplay) {
                netDisplay.setAttribute("data-target", "0");
                displayRing();
            }
        }
    }

    async function loadTodayHistory() {
        const userSession = sessionStorage.getItem("user");
        if (!userSession) return;
        const userObj = JSON.parse(userSession);
        const userId = userObj.id;
        try {
            const response = await fetch(`${WORKOUT_API_URL}/history?userId=${userId}`);
            if (!response.ok) throw new Error("Failed to load history workout data.");

            const workoutHistory = await response.json();

            // --- CLEAN SEPARATION OF CONCERNS ---
            renderHistory(workoutHistory);
            setupHistoryModalToggle(workoutHistory);
        } catch (error) {
            console.error("Dashboard hydration error:", error);
        }
    }

    function renderHistory(workoutHistory) {
        const dailyHistoryList = document.getElementById("dailyHistoryList");
        const previewHistoryContainer = document.getElementById("previewHistoryList");

        if (!dailyHistoryList) return;

        dailyHistoryList.innerHTML = "";
        if (previewHistoryContainer) previewHistoryContainer.innerHTML = "";

        if (workoutHistory.length === 0) {
            dailyHistoryList.innerHTML = "<li>No workouts logged yet.</li>";
            return;
        }

        workoutHistory.forEach((workout, index) => {
            const displayString = formatWorkoutMetrics(workout);

            // 1. Append to the master scrollable layout list
            const mainLi = document.createElement("li");
            mainLi.innerHTML= displayString;
            dailyHistoryList.appendChild(mainLi);

            // 2. Append only the 2 most recent rows to the dashboard summary preview container cards
            if (previewHistoryContainer && index < 1) {
                const previewLi = document.createElement("li");
                previewLi.innerHTML = displayString;
                previewHistoryContainer.appendChild(previewLi);
            }
        });
    }


    async function submitFoodEntry(event){
        event.preventDefault();
        const userSession = sessionStorage.getItem("user");
        if (!userSession) {
            alert("User session not found. Please log in again.");
            return;
        }

        const userObj = JSON.parse(userSession);
        const userId = userObj.id;
        const todayStr = new Date().toISOString().split('T')[0];

        try {
            const elMealType = document.getElementById("mealType");
            const elFoodName = document.getElementById("foodName");
            const elFoodCalories = document.getElementById("foodCalories");
            const elProtein = document.getElementById("protein");
            const elCarb = document.getElementById("carb");
            const elFat = document.getElementById("fat");   

            // Parse numerical strings safely to match your backend data types
            const caloriesValue = elFoodCalories ? parseInt(elFoodCalories.value) || 0 : 0;
            const proteinValue = elProtein ? parseFloat(elProtein.value) || 0 : 0;
            const carbValue = elCarb ? parseFloat(elCarb.value) || 0 : 0;
            const fatValue = elFat ? parseFloat(elFat.value) || 0 : 0;

            // Construct payload matching your singular Java Entity fields
            const foodEntryPayLoad = {
                user: { id: userId },
                mealType: elMealType ? elMealType.value.toUpperCase() : "BREAKFAST",
                name: elFoodName ? elFoodName.value.trim() : "Unknown Meal",
                calories: caloriesValue,
                protein: proteinValue,
                carb: carbValue,  
                fat: fatValue,   
                date: todayStr
            };

            const respone = await fetch(FOOD_API_URL,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(foodEntryPayLoad)
            });
            console.log(foodEntryPayLoad);
            if(!respone.ok) throw new Error ("Failed to record active food entry");
            alert("Meal logged successfully");
        } catch (error) {
            console.error("Pipeline failure:", error);
            alert(error.message);
        }
    }
    /**
 * Formats a single food entry into a clean, structured HTML row block
 */
    function formatFoodMetrics(food) {
        const mealType = food.mealType || "Meal";
        const name = food.name || "Unknown Item";
        const calories = food.calories || 0;
        
        // Parse macros with safe zero fallbacks if properties come back null
        const p = food.protein ? Math.round(food.protein) : 0;
        const c = food.carbs   ? Math.round(food.carbs)   : 0;
        const f = food.fats    ? Math.round(food.fats)    : 0;

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

    /**
     * Iterates over food arrays and populates the nutrition dashboard card view areas
     */
    function renderFoodHistory(foodHistory) {
        const foodHistoryList = document.getElementById("foodHistoryList");
        if (!foodHistoryList) return;

        foodHistoryList.innerHTML = "";

        if (foodHistory.length === 0) {
            foodHistoryList.innerHTML = "<li style='text-align:center; color:#999; padding:10px;'>No meals logged yet today.</li>";
            return;
        }

        foodHistory.forEach(food => {
            const mainLi = document.createElement("li");
            mainLi.innerHTML = formatFoodMetrics(food);
            foodHistoryList.appendChild(mainLi);
        });
    }

    function formatWorkoutMetrics(workout){
        const type = workout.exercise.workoutType ? workout.exercise.workoutType : "";
        const name = workout.exercise.name ? workout.exercise.name : "";
        const date = new Date(workout.date +"T00:00:00");
        const calories = workout.calories ? workout.calories : "";
        const reps = workout.reps ? workout.reps : "";
        const sets = workout.sets ? workout.sets : "";
        const intensity = workout.intensity ? workout.intensity : "";
        const weight = workout.weight ? workout.weight : "";
        const formattedDate = date.toLocaleDateString("en-US", {
            weekday: "long",  // "Monday", "Tuesday"
            month: "short",   // "Jan", "Feb"
            day: "numeric",   // "1", "2"
            year: "numeric"   // "2026"
        });
        
        const headerRow = `
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
                <span>${formattedDate}</span>
                <span>${type}</span>
            </div>`;
            
        const statsRow = `
            <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.95rem;">
                <span>🔥 Calories Burned: ${calories ? `${calories}` : "N/A"} kcal</span>
                <span>⏱️ ${workout.duration} mins ${intensity ? `(${intensity})` : ""}</span>
            </div>`;

        switch (type) {
            case "Weightlifting":
                return `
                    <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
                        ${headerRow}
                        ${statsRow}
                        <div style="margin-top: 6px; font-size: 0.9rem; color: #222; background: #f9f9f9; padding: 6px 10px; border-radius: 4px;">
                            <strong>Exercise:</strong> ${sets ? `${sets} x` : ""} ${name} ${weight ? `${weight}kg` : ""} ${reps ? `x ${reps}` : ""}
                        </div>
                    </div>`;
                
            case "Running":
            case "Cycling":
            case "Swimming":
                const distanceStr = workout.distance ? ` 🏃 ${workout.distance} km` : "";
                return `
                    <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
                        ${headerRow}
                        <div style="display: flex; justify-content: space-between; color: #555; font-size: 0.95rem;">
                            <span>🔥 Calories Burned: ${calories} kcal</span>
                            <span>⏱️ ${workout.duration} mins |${distanceStr}</span>
                        </div>
                    </div>`;
                
            default:
                return `
                    <div style="padding: 12px 0; border-bottom: 1px solid #eee; width: 100%;">
                        ${headerRow}
                        ${statsRow}
                    </div>`;
        }
    }

    function setupHistoryModalToggle(history) {
        const seeMoreBtn = document.getElementById("seeMoreBtn");
        const historyModal = document.getElementById("historyModal");

        if (!seeMoreBtn || !historyModal || history.length === 0) return;

        // Remove any previous duplicate listeners before registering a new one
        seeMoreBtn.replaceWith(seeMoreBtn.cloneNode(true));
        document.getElementById("seeMoreBtn").addEventListener("click", () => {
            historyModal.classList.remove("hidden");
        });
    }