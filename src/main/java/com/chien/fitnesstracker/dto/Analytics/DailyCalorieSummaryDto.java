package com.chien.fitnesstracker.dto.Analytics;

public record DailyCalorieSummaryDto(
    String date,
    Double caloriesEaten,
    Double caloriesBurned
) {}