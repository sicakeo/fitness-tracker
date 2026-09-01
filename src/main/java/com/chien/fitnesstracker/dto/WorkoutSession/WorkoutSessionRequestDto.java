package com.chien.fitnesstracker.dto.WorkoutSession;

import java.time.LocalDate;
import java.util.List;

import com.chien.fitnesstracker.dto.WorkoutEntry.WorkoutEntryRequestDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WorkoutSessionRequestDto(
    @NotNull(message = "User ID is required")
    Long userId,

    @NotNull(message = "Title is required")
    String title,

    @NotNull(message = "Date is required")
    LocalDate date,

    @Min(value = 0, message = "Total duration cannot be negative")
    Integer totalDurationMinutes, // in minutes
    
    @Min(value = 0, message = "Total calories burned cannot be negative")
    Double totalCaloriesBurned, // in kcal
    
    List<WorkoutEntryRequestDto> entries
) {}
