package com.chien.fitnesstracker.service.impl;

import com.chien.fitnesstracker.model.FoodEntry;
import com.chien.fitnesstracker.repository.FoodEntryRepository;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.service.FoodEntryService;
import com.chien.fitnesstracker.dto.FoodEntry.FoodEntryRequestDto;
import com.chien.fitnesstracker.dto.FoodEntry.FoodEntryResponseDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FoodEntryServiceImpl implements FoodEntryService {
    private final FoodEntryRepository foodEntryRepository;
    private final UserRepository userRepository;

    public FoodEntryServiceImpl(FoodEntryRepository foodEntryRepository, UserRepository userRepository) {
        this.foodEntryRepository = foodEntryRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public FoodEntryResponseDto getFoodEntryById(Long id) {
        Optional<FoodEntry> optional = foodEntryRepository.findById(id);
        FoodEntry foodEntry;
        if (optional.isPresent()) foodEntry = optional.get();
        else throw new RuntimeException("Food entry not found for id: " + id);

        return mapToResponseDto(foodEntryRepository.save(foodEntry));
    }

    @Override
    public FoodEntryResponseDto saveFoodEntry(FoodEntryRequestDto foodEntry) {
        FoodEntry newFoodEntry = new FoodEntry();
        newFoodEntry.setUser(userRepository.findById(foodEntry.userId())
                .orElseThrow(() -> new RuntimeException("User not found for id: " + foodEntry.userId())));
        newFoodEntry.setName(foodEntry.name());
        newFoodEntry.setCalories(foodEntry.calories());
        newFoodEntry.setProtein(foodEntry.protein());
        newFoodEntry.setCarbs(foodEntry.carbs());
        newFoodEntry.setFat(foodEntry.fat());
        newFoodEntry.setDate(foodEntry.date());
        newFoodEntry.setMealType(foodEntry.mealType());
        return  mapToResponseDto(foodEntryRepository.save(newFoodEntry));
    }

    @Override
    public FoodEntryResponseDto updateFoodEntry(Long id, FoodEntryRequestDto foodDetails) {
        FoodEntry foodEntry = foodEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food entry not found for id: " + id));
        
        return mapToResponseDto(foodEntryRepository.save(foodEntry));
    }

    @Override
    public void deleteFoodEntryById(Long id) {
        foodEntryRepository.deleteById(id);
    }

    @Override
    public Double getCaloriesToday(Long userId, LocalDate Date){
        return foodEntryRepository.sumByCaloriesByUserIdAndDate(userId, Date);
    }

    @Override
    public List<FoodEntryResponseDto> getFoodEntriesByUserId(Long userId){
       List<FoodEntry> foodEntries = foodEntryRepository.findByUserIdOrderByDateDesc(userId);
       return foodEntries.stream().map(this::mapToResponseDto).toList();
    }


    private FoodEntryResponseDto mapToResponseDto(FoodEntry foodEntry) {
        return new FoodEntryResponseDto(
                foodEntry.getId(),
                foodEntry.getUser().getId(),
                foodEntry.getName(),
                foodEntry.getCalories(),
                foodEntry.getProtein(),
                foodEntry.getCarbs(),
                foodEntry.getFat(),
                foodEntry.getDate(),
                foodEntry.getMealType()
        );
    }
}
