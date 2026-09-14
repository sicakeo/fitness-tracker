package com.chien.fitnesstracker.dto.User;

import com.chien.fitnesstracker.model.enums.FitnessGoal;

public record UserResponseDto(
    Long id,
    String username,
    String name,
    Double weight,
    Double height,
    Integer age,
    String gender,
    Double activityLevel,
    FitnessGoal fitnessGoal,
    Double tdee
) {}