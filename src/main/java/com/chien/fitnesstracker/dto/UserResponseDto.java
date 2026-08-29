package com.chien.fitnesstracker.dto;

public record UserResponseDto(
    Long id,
    String username,
    String email,
    Double weight,
    Double height,
    Integer age,
    String gender,
    Double activityLevel,
    String fitnessGoal,
    Double tdee
) {}