package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.FoodEntry;

import java.util.List;

public interface FoodEntryService {
    List<FoodEntry> getFoodEntries();
    FoodEntry getFoodEntryById(Long id);
    FoodEntry saveFoodEntry(FoodEntry foodEntry);
    FoodEntry updateFoodEntry(Long id, FoodEntry foodEntry);
    void deleteFoodEntryById(Long id);
}
