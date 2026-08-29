package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.LoginRequestDto;
import com.chien.fitnesstracker.dto.UserRegisterRequestDto;
import com.chien.fitnesstracker.dto.UserResponseDto;
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
    public ResponseEntity<UserResponseDto> register(@RequestBody UserRegisterRequestDto user) {
        return ResponseEntity.ok(userService.registerNewUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(@RequestBody LoginRequestDto loginRequest) {
        UserResponseDto authenticatedUser = userService.authenticateUser(loginRequest);
        return ResponseEntity.ok(authenticatedUser);
    }
}