package com.chien.fitnesstracker.dto.WorkoutEntry;

import com.chien.fitnesstracker.model.enums.IntensityType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WorkoutEntryRequestDto(
    @NotNull(message = "Workout entry ID is required")
    Long id,

    @NotNull(message = "Exercise ID is required")
    Long exerciseId,

    @NotNull(message = "Workout session ID is required")
    Long workoutSessionId,

    @Min( value = 0, message = "Sets cannot be negative")
    Integer sets, 

    @Min(value = 0, message = "Reps cannot be negative")
    Integer reps,

    @Min(value = 0, message = "Weight cannot be negative")
    Double weight, // in kg

    @Min(value = 0, message = "Duration cannot be negative")
    Integer durationMinutes,

    @Min(value = 0, message = "Distance cannot be negative")
    Double distanceKm,
    
    IntensityType intensity
) {}
