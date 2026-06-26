package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.FoodEntry;
import com.chien.fitnesstracker.repository.FoodEntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FoodEntryServiceImpl implements FoodEntryService {
    private final FoodEntryRepository foodEntryRepository;

    public FoodEntryServiceImpl(FoodEntryRepository foodEntryRepository) {
        this.foodEntryRepository = foodEntryRepository;
    }

    @Override
    public List<FoodEntry> getFoodEntries() {
        return foodEntryRepository.findAll();
    }

    @Override
    public FoodEntry getFoodEntryById(Long id) {
        Optional<FoodEntry> optional = foodEntryRepository.findById(id);
        FoodEntry foodEntry;
        if (optional.isPresent()) foodEntry = optional.get();
        else throw new RuntimeException("Food entry not found for id: " + id);

        return foodEntry;
    }

    @Override
    public FoodEntry saveFoodEntry(FoodEntry foodEntry) {
        return foodEntryRepository.save(foodEntry);
    }

    @Override
    public FoodEntry updateFoodEntry(Long id, FoodEntry foodDetails) {
        FoodEntry foodEntry = getFoodEntryById(id);
        foodEntry.setName(foodDetails.getName());
        foodEntry.setCalories(foodDetails.getCalories());
        foodEntry.setFat(foodDetails.getFat());
        foodEntry.setProtein(foodDetails.getProtein());
        foodEntry.setCarb(foodDetails.getCarb());
        foodEntry.setDate(foodDetails.getDate());
        return foodEntryRepository.save(foodEntry);
    }

    @Override
    public void deleteFoodEntryById(Long id) {
        foodEntryRepository.deleteById(id);
    }

    @Override
    public Double getCaloriesToday(Long userId, LocalDate Date){
        return foodEntryRepository.sumByCaloriesByUserIdAndDate(userId, Date);
    }
}
