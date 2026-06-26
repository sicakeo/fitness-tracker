package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.FoodEntry;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.repository.query.Param;

public interface FoodEntryService {
    List<FoodEntry> getFoodEntries();
    FoodEntry getFoodEntryById(Long id);
    FoodEntry saveFoodEntry(FoodEntry foodEntry);
    FoodEntry updateFoodEntry(Long id, FoodEntry foodEntry);
    void deleteFoodEntryById(Long id);
    Double getCaloriesToday(@Param("userId") Long userId, @Param("date") LocalDate date);
}
