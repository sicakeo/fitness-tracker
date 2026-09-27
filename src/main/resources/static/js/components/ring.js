// ==========================================
// Ring Display Module
// ==========================================

export function displayRing(circle, netDisplay, targetDisplay) {

    if (!netDisplay || !targetDisplay || !circle) return;

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
            netDisplay.innerText = rawCalories; 
            clearInterval(interval);
            return;
        }

        const incrementStep = Math.max(Math.ceil(finalCalories / 50), 1);
        currentCalories += incrementStep;
        if (currentCalories > finalCalories) currentCalories = finalCalories;

        netDisplay.innerText = isNegative ? -currentCalories : currentCalories;

        const percentage = currentCalories / targetCalories;
        
        if (isNegative) {
            circle.style.strokeDashoffset = circumference + (Math.min(percentage, 1) * circumference);
            circle.style.stroke = "#e74c3c";
        } else {
            circle.style.strokeDashoffset = circumference - (Math.min(percentage, 1) * circumference);
            circle.style.stroke = "#3498db";
        }
    }, stepTime);
}