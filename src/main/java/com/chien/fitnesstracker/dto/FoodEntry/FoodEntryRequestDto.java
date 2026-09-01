package com.chien.fitnesstracker.dto.FoodEntry;

import java.time.LocalDate;

import com.chien.fitnesstracker.model.enums.MealType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FoodEntryRequestDto(
        @NotNull(message = "User ID is required")
        Long userId,
        
        @NotBlank(message = "Name is required")
        String name,

        @Min(value = 0, message = "Calories cannot be negative")
        Double calories,

        @Min(value = 0, message = "Protein cannot be negative")
        Double protein,
        
        @Min(value = 0, message = "Carbs cannot be negative")
        Double carbs,

        @Min(value = 0, message = "Fats cannot be negative")
        Double fat,

        @NotNull(message = "Date is required")
        LocalDate date,
        
        @NotNull(message = "Meal type is required")
        MealType mealType
) {}
