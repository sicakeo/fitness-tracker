package com.chien.fitnesstracker.dto.FoodEntry;

import java.time.LocalDate;
import com.chien.fitnesstracker.model.enums.MealType;

public record FoodEntryResponseDto(
        Long id,
        Long userId,
        String name,
        Double calories,
        Double protein,
        Double carbs,
        Double fat,
        LocalDate date,
        MealType mealType
) {}