const USER_API_URL = "http://localhost:8080/api/users"
import { isLoggedIn, logout } from "./login.js";
import { calculateBMR } from "./fitnessMath.js";
document.addEventListener("DOMContentLoaded", () => {
    let unitSelect = "standard";
    const standard = document.getElementById("standard-btn");
    const metric = document.getElementById("metric-btn");
    if(!isLoggedIn()){
        if(document.getElementById("feet")) document.getElementById("feet").value = "";
        if(document.getElementById("inches")) document.getElementById("inches").value = "";
        if(document.getElementById("lbs")) document.getElementById("lbs").value = "";
        if(document.getElementById("kg")) document.getElementById("kg").value = "";
        if(document.getElementById("cm")) document.getElementById("cm").value = "";
        if(document.getElementById("age")) document.getElementById("age").value = "";
        if(document.getElementById("gender")) document.getElementById("gender").value = "";
    } else{
        const navRight = document.getElementById("nav-right");
        navRight.innerHTML = `<li><span id="signOutLink" class="logout-text">Sign out</span></li>`;
        document.getElementById("signOutLink").addEventListener("click", logout);
        let userSession = sessionStorage.getItem("user");
        if(userSession){
            const user = JSON.parse(userSession);
            const weight= user.weight || 0;
            const height = user.height || 0;
            const totalInches = height/2.54;
            const feet = Math.floor(totalInches/12);
            const inches = Math.round(totalInches%12);
            document.getElementById("feet").value = feet.toFixed(2);
            document.getElementById("inches").value = inches.toFixed(2);
            document.getElementById("lbs").value = (weight*2.20462).toFixed(2);

            document.getElementById("cm").value = height.toFixed(2);
            document.getElementById("kg").value = weight.toFixed(2);
            document.getElementById("age").value = user.age || "";
            document.getElementById("gender").value = user.gender || "";
        }
    }
    
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
    

    const bmrForm = document.getElementById("bmr-form");
    if (bmrForm) {
        bmrForm.addEventListener("submit", (event) => {
            event.preventDefault(); 

            //calculate BMR
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

            const age = parseInt(document.getElementById("age").value) || 0;
            const gender = document.getElementById("gender").value.trim().toLowerCase();
            const bmr = calculateBMR(unitSelect, weight, height, age, gender);
            if (bmr>0) {
                document.getElementById("resultMessage").innerHTML = `BMR = ${bmr.toFixed(2)} kcal/day`;
            } else {
                document.getElementById("resultMessage").innerHTML = "Please enter valid values.";
            }
            
            const userSession = sessionStorage.getItem("user");
            if (userSession) {
                const user = JSON.parse(userSession);
                const updatedUser = {
                    ...user,
                    weight: unitSelect === "standard" ? weight * 0.453592 : weight, 
                    height: unitSelect === "standard" ? height * 2.54 : height, 
                    age: age,
                    gender: gender
                };
                sessionStorage.setItem("user", JSON.stringify(updatedUser));

                fetch(`${USER_API_URL}/${user.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedUser)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("User updated successfully:", data);
                })
                .catch(error => {
                    console.error("Error updating user:", error);
                });
            }

        });
    }
});

