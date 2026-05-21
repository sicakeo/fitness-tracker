const REGISTER_API_URL = "http://localhost:8080/api/users/register"

async function register(event){
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const email = document.getElementById("email").value;
    const confirmEmail = document.getElementById("confirmEmail").value;
    if(password !== confirmPassword){
        alert("Passwords do not match");
        return;
    }
    if(email !== confirmEmail){
        alert("Email do not match");
        return;
    }
    try{
        const response = await fetch(`${REGISTER_API_URL}`, {
            method : "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({username, password, email})
        }); 
        if(!response.ok)
            throw new Error("Registration failed");
        const responseData = await response.json();
        sessionStorage.setItem("user", JSON.stringify(responseData));
        alert("Registration succsessfully");
        window.location.href = "/home";
    } catch (error){
        alert(error.message);
    }

}

document.addEventListener("DOMContentLoaded", () =>{
    const registerForm = document.getElementById("registerForm");
    if(registerForm)
        registerForm.addEventListener("submit", register);
});