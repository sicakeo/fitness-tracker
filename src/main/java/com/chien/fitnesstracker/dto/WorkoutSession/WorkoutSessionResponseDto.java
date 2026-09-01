package com.chien.fitnesstracker.dto.WorkoutSession;

import java.time.LocalDate;
import java.util.List;

import com.chien.fitnesstracker.dto.WorkoutEntry.WorkoutEntryResponseDto;

public record WorkoutSessionResponseDto(
    Long id,
    Long userId,
    String title,
    LocalDate date,
    Integer totalDurationMinutes,
    Double totalCaloriesBurned,
    List<WorkoutEntryResponseDto> entries
) {}
