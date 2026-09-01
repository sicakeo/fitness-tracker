package com.chien.fitnesstracker.dto;

import com.chien.fitnesstracker.model.enums.exerciseType;

public record ExerciseResponseDto (
    Long id,
    Long userId,
    String name,
    exerciseType exerciseType,
    Double met
) {}
