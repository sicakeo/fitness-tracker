package com.chien.fitnesstracker.dto;

import com.chien.fitnesstracker.model.enums.IntensityType;

public record WorkoutEntryResponseDto (
    Long id,
    Long workoutSessionId,
    Long exerciseId,
    String exerciseType,
    String exerciseName,
    Integer sets,
    Integer reps,
    Double weight, // in kg
    Integer durationMinutes,
    Double distanceKm,
    IntensityType intensity
) {}
