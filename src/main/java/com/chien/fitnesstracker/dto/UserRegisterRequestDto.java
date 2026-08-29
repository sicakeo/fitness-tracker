package com.chien.fitnesstracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UserRegisterRequestDto (
    @NotBlank(message = "Username is required")
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    String password,

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    Double weight,

    @NotNull(message = "Height is required")
    @Positive(message = "Height must be positive")
    Double height,

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be positive")
    Integer age,

    @NotBlank(message = "Gender is required")
    String gender,

    @NotBlank(message = "Activity level is required")
    Double activityLevel,
    
    @NotNull(message = "Fitness goal is required")
    String fitnessGoal,

    @NotNull(message = "TDEE is required")
    Double tdee
) {}
