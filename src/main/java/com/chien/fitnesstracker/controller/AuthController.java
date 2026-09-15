package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.User.AuthResponseDto;
import com.chien.fitnesstracker.dto.User.LoginRequestDto;
import com.chien.fitnesstracker.dto.User.UserRegisterRequestDto;
import com.chien.fitnesstracker.dto.User.UserResponseDto;
import com.chien.fitnesstracker.service.UserService;
import com.chien.fitnesstracker.security.JwtService;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping ("/register")
    public ResponseEntity<AuthResponseDto> registerUser(@RequestBody UserRegisterRequestDto userRegisterRequestDto) {
        UserResponseDto response = userService.registerNewUser(userRegisterRequestDto);
        String token = jwtService.generateToken(response.username());
        AuthResponseDto authResponse = new AuthResponseDto(response, token);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping ("/login")
    public ResponseEntity<AuthResponseDto> loginUser(@RequestBody LoginRequestDto loginRequestDto) {
        UserResponseDto response = userService.authenticateUser(loginRequestDto);
        String token = jwtService.generateToken(response.username());
        AuthResponseDto authResponse = new AuthResponseDto(response, token);
        return ResponseEntity.ok(authResponse); 
    }
}