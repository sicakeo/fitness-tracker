const USER_API_URL = "http://localhost:8080/";
import { isLoggedIn } from "./login.js";
document.addEventListener("DOMContentLoaded", () =>{
    if(!isLoggedIn())
        return;
    event.preventDefault();
    window.location.href = "/";
})