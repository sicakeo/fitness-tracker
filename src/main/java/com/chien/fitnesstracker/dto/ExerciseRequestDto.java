package com.chien.fitnesstracker.dto;

import com.chien.fitnesstracker.model.enums.exerciseType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ExerciseRequestDto( 
    @NotNull(message = "User ID is required")
    Long userId,

    @NotBlank(message = "Exercise name is required")
    String name,

    @NotNull(message = "Exercise type is required")
    exerciseType exerciseType,
    
    @NotNull(message = "MET value is required")
    @Positive(message = "MET value must be positive")
    Double met
    ) {}
    