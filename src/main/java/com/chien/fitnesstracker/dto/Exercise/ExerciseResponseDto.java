package com.chien.fitnesstracker.dto.Exercise;

import com.chien.fitnesstracker.model.enums.exerciseType;

public record ExerciseResponseDto (
    Long id,
    Long userId,
    String name,
    exerciseType exerciseType,
    Double met
) {}
