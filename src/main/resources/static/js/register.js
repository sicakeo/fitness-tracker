const REGISTER_API_URL = "http://localhost:8080/api/auth/register";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegistration);
    }
});

/**
 * Orchestrates user sign-up submissions, executes local UX validation validations,
 * and handles precise error propagation loops from backend clusters
 */
async function handleRegistration(event) {
    event.preventDefault();

    // 1. Gather input field values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const email = document.getElementById("email").value.trim();
    const confirmEmail = document.getElementById("confirmEmail").value.trim();

    // 2. Frontend UX Validation Checks
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    if (email !== confirmEmail) {
        alert("Emails do not match.");
        return;
    }

    // Optional: Add a quick password complexity UX check before firing the request
    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    // 3. Initiate Asynchronous Network Data Sync Pipeline
    try {
        const response = await fetch(REGISTER_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        // THE EXACT BACKEND ERROR HANDLER: Parse validation models safely
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (errorData.errors) {
                // Clear all stale errors from previous attempts
                document.querySelectorAll('.field-error').forEach(el => el.textContent = "");
                document.querySelectorAll('input').forEach(el => el.classList.remove('invalid-field'));

                // Loop through specific backend map keys (e.g., "name", "reps")
                Object.entries(errorData.errors).forEach(([fieldKey, errorMessage]) => {
                    // Find the matching error placeholder span
                    const errorEl = document.getElementById(`error-${fieldKey}`);
                    const inputEl = document.getElementById(fieldKey);
                    
                    if (errorEl) {
                        errorEl.textContent = errorMessage; 
                    }
                    if (inputEl) {
                        inputEl.classList.add('invalid-field');
                    }
                });
            
                return;
            }

            if (response.status === 500) {
                throw new Error("Internal server error occurred. Please verify your backend logs.");
            }
            
            throw new Error(errorData.message || "Registration failed due to invalid field constraints.");
        }

        const responseData = await response.json();
        // Save the safe, password-free user metadata model into session space
        sessionStorage.setItem("user", JSON.stringify(responseData));
        
        alert("Registration successful!");
        window.location.href = "/home";

    } catch (error) {
        console.error("Registration pipeline exception:", error);
        alert(error.message);
    }
}