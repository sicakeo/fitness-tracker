package com.chien.fitnesstracker.dto.FoodEntry;

public record FoodSearchResultDto(
    String description,
    Double calories,
    Double protein,
    Double carbs,
    Double fat
) {}