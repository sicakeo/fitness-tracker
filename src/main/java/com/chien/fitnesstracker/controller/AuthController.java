package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.service.UserService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerNewUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User loginRequest) {
        User authenticatedUser = userService.authenticateUser(
                loginRequest.getUsername(), 
                loginRequest.getPassword()
        );
        return ResponseEntity.ok(authenticatedUser);
    }
}