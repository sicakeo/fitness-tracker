package com.chien.fitnesstracker.dto;

import java.time.LocalDate;
import java.util.List;

public record WorkoutSessionResponseDto(
    Long id,
    Long userId,
    String title,
    LocalDate date,
    Integer totalDurationMinutes,
    Double totalCaloriesBurned,
    List<WorkoutEntryResponseDto> entries
) {}
