package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.FoodEntry.FoodEntryRequestDto;
import com.chien.fitnesstracker.dto.FoodEntry.FoodEntryResponseDto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.repository.query.Param;

public interface FoodEntryService {
    FoodEntryResponseDto getFoodEntryById(Long id);
    FoodEntryResponseDto saveFoodEntry(FoodEntryRequestDto foodEntry);
    FoodEntryResponseDto updateFoodEntry(Long id, FoodEntryRequestDto foodEntry);
    void deleteFoodEntryById(Long id);
    Double getCaloriesToday(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<FoodEntryResponseDto> getFoodEntriesByUserId(Long userId);
}
