package com.chien.fitnesstracker.dto.Exercise;

import com.chien.fitnesstracker.model.enums.ExerciseType;

public record ExerciseResponseDto (
    Long id,
    Long userId,
    String name,
    ExerciseType exerciseType,
    Double met
) {}
