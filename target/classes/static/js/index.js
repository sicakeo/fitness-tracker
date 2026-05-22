const USER_API_URL = "http://localhost:8080/";
import { checkAuth } from "./login.js";
document.addEventListener("DOMContentLoaded", () =>{
    if(!checkAuth())
        return;
    event.preventDefault();
    window.location.href = "/home";
})