package com.chien.fitnesstracker.dto;

import java.time.LocalDate;
import java.util.List;

public record WorkoutSessionRequestDto(
    Long userId,
    String title,
    LocalDate date,
    Integer totalDurationMinutes, // in minutes
    Double totalCaloriesBurned, // in kcal
    List<WorkoutEntryRequestDto> entries
) {}
