
export function calculate(unitSelect){
    let bmi;
    let height;
    let weight;
    if(unitSelect === "standard"){
        const feetValue = parseFloat(document.getElementById("feet").value) || 0;
        const inchesValue = parseFloat(document.getElementById("inches").value) || 0;
        
        height = (feetValue * 12) + inchesValue;
        weight = parseFloat(document.getElementById("lbs").value) || 0;
        
        if (height > 0) {
            bmi = (weight / Math.pow(height, 2)) * 703; 
        }
    } else{
        const cmValue = parseFloat(document.getElementById("cm").value) || 0;
        
        height = cmValue / 100.0; // Converts centimeters to meters cleanly
        weight = parseFloat(document.getElementById("kg").value) || 0;
        
        if (height > 0) {
            bmi = weight / Math.pow(height, 2);
        }
    }
   if (bmi) {
        document.getElementById("resultMessage").innerHTML = `BMI = ${bmi.toFixed(2)} kg/m<sup>2</sup>`;
    } else {
        document.getElementById("resultMessage").innerHTML = "Please enter valid values.";
    }
}