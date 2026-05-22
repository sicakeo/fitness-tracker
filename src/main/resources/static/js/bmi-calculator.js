const USER_API_URL = "http://localhost:8080/users/api"
import { isLoggedIn, logout } from "./login.js";
import { calculate } from "./fitnessMath.js";
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
            const kg = user.weight || 0;
            const cm = user.height || 0;
            if(unitSelect === "standard"){
                const totalInches = cm/2.54;
                const feet = Math.floor(totalInches/12);
                const inches = Math.round(totalInches%12);
                document.getElementById("feet").value = feet;
                document.getElementById("inches").value = inches;

                if (kg > 0) {
                    // Convert kg to lbs: kg * 2.20462
                    document.getElementById("lbs").value = Math.round(kg * 2.20462);
                }
            } else{
                if (cm > 0) document.getElementById("cm").value = cm;
                if (kg > 0) document.getElementById("kg").value = kg;
            }
        }
    }

    const bmiForm = document.getElementById("bmi-form");
    if (bmiForm) {
        bmiForm.addEventListener("submit", (event) => {
            event.preventDefault(); 
            calculate(unitSelect);
        });
    }
});

