const USER_API_URL = "http://localhost:8080/users/api"
import { isLoggedIn, logout } from "./login.js";
import { calculateBMI } from "./fitnessMath.js";
document.addEventListener("DOMContentLoaded", () => {
    let unitSelect;
    const standard = document.getElementById("standard-btn");
    const metric = document.getElementById("metric-btn");
    standard.addEventListener("click", function(){
        unitSelect = "standard";
        document.getElementById("standard-height-group").style.cssText = "block";
        document.getElementById("standard-weight-group").style.display = "block";
        document.getElementById("metric-height-group").style.display = "none";
        document.getElementById("metric-weight-group").style.display = "none";
        document.getElementById("standard-btn").style.backgroundColor = "green";
        document.getElementById("metric-btn").style.backgroundColor = "gray";
    });
    metric.addEventListener("click", function(){
        unitSelect = "metric";
        document.getElementById("standard-height-group").style.display = "none";
        document.getElementById("standard-weight-group").style.display = "none";
        document.getElementById("metric-height-group").style.display = "block";
        document.getElementById("metric-weight-group").style.display = "block";
        document.getElementById("standard-btn").style.backgroundColor = "gray";
        document.getElementById("metric-btn").style.backgroundColor = "green";
    });
    if(!isLoggedIn()){
       document.getElementById("feet").setAttribute("0");
       document.getElementById("inches").setAttribute("0");
       document.getElementById("lbs").setAttribute("0");
       document.getElementById("kg").setAttribute("0");
       document.getElementById("cm").setAttribute("0");
    } else{
        const navRight = document.getElementById("nav-right");
        navRight.innerHTML = `<li><span id="signOutLink" class="logout-text">Sign out</span></li>`;
        document.getElementById("signOutLink").addEventListener("click", logout);
        let userSession = sessionStorage.getItem("user");
        if(userSession){
            const user = JSON.parse(userSession);
            const weight= user.weight || 0;
            const height = user.height || 0;
            if(unitSelect === "standard"){
                const totalInches = height/2.54;
                const feet = Math.floor(totalInches/12);
                const inches = Math.round(totalInches%12);
                document.getElementById("feet").value = feet;
                document.getElementById("inches").value = inches;

                if (weight > 0) {
                    // Convert kg to lbs: kg * 2.20462
                    document.getElementById("lbs").value = Math.round(weight * 2.20462);
                }
            } else{
                if (height > 0) document.getElementById("cm").value = height;
                if (weight > 0) document.getElementById("kg").value = weight;
            }

        }
    }

    const bmiForm = document.getElementById("bmi-form");
    if (bmiForm) {
        bmiForm.addEventListener("submit", (event) => {
            event.preventDefault(); 

            //calculate BMI
            let height = 0;
            let weight = 0;
            if (unitSelect === "standard") {
                const feet = parseFloat(document.getElementById("feet").value) || 0;
                const inches = parseFloat(document.getElementById("inches").value) || 0;
               
                height = (feet * 12) + inches; 
                weight = parseFloat(document.getElementById("lbs").value) || 0;
            } else {
                height = parseFloat(document.getElementById("cm").value) || 0;
                weight = parseFloat(document.getElementById("kg").value) || 0;
            }
            const bmi = calculateBMI(unitSelect, weight, height);
            if (bmi) {
                document.getElementById("resultMessage").innerHTML = `BMI = ${bmi.toFixed(2)} kg/m<sup>2</sup>`;
            } else {
                document.getElementById("resultMessage").innerHTML = "Please enter valid values.";
            }
            
            // If they are logged in, we want to save this BMI value to their profile in the database, and session storage
            if (isLoggedIn()) {
                let userSession = sessionStorage.getItem("user");
                if (userSession) {
                    const user = JSON.parse(userSession);

                    //Update the properties on your local session object instance
                    user.bmi = bmi; 
                    // If they are using metric inputs, you can sync their raw height/weight too!
                    if (unitSelect === "metric") {
                        user.height = parseFloat(document.getElementById("cm").value) || user.height;
                        user.weight = parseFloat(document.getElementById("kg").value) || user.weight;
                    } else if (unitSelect === "standard") {
                        const totalInches = height;
                        const heightInCm = totalInches * 2.54;
                        user.height = heightInCm || user.height;
                        user.weight = weight ? weight / 2.20462 : user.weight; // Convert lbs to kg
                    }

                    //Update the session storage with the new user object state

                    sessionStorage.setItem("user", JSON.stringify(user));

                    //Send the entire user object payload to your new unified sync endpoint
                    fetch(`${USER_API_URL}/sync-profile`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user) // Passing the complete object!
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to sync user profile data with database.");
                        }
                        console.log("Profile synchronized successfully.");
                    })
                    .catch(error => console.error("Error:", error));
                }
            }
        });
    }
});

