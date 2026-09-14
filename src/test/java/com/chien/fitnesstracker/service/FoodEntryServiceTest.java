package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.FoodEntry.FoodEntryRequestDto;
import com.chien.fitnesstracker.dto.FoodEntry.FoodEntryResponseDto;
import com.chien.fitnesstracker.model.FoodEntry;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.model.enums.MealType;
import com.chien.fitnesstracker.repository.FoodEntryRepository;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.service.impl.FoodEntryServiceImpl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;


@ExtendWith(MockitoExtension.class)
public class FoodEntryServiceTest {

    @Mock
    private FoodEntryRepository foodEntryRepository; // Simulated DB dependency

    @Mock 
    private UserRepository userRepository; // Simulated User repository dependency
    
    @InjectMocks
    private FoodEntryServiceImpl foodEntryService; // Injects the mock repo into your real service

    private FoodEntry testFoodEntry;

    private FoodEntry createSampleFoodEntry() {
        User testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("password");

        FoodEntry foodEntry = new FoodEntry();
        foodEntry.setName("Apple");
        foodEntry.setCalories(95.0);
        foodEntry.setCarbs(10.0);
        foodEntry.setProtein(0.5);
        foodEntry.setFat(0.3);
        foodEntry.setDate(java.time.LocalDate.now());
        foodEntry.setUser(testUser);
        foodEntry.setMealType(MealType.BREAKFAST);
        return foodEntry;
    }

    private FoodEntryRequestDto createSampleFoodEntryRequest() {
        return new FoodEntryRequestDto(
                1L, // userId
                "Apple",
                95.0,
                0.5,
                10.0,
                0.3,
                java.time.LocalDate.now(),
                MealType.BREAKFAST
        );
    }

    private FoodEntryResponseDto createSampleFoodEntryResponse(FoodEntry foodEntry) {
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


    @DisplayName("Should throw RuntimeException when getFoodEntryById is called with non-existing id")
    @Test
    void shouldThrowRuntimeExceptionWhenGetFoodEntryByIdIsCalledWithNonExistingId() {
        // GIVEN: The repository returns empty for a non-existing id
        when(foodEntryRepository.findById(1L)).thenReturn(Optional.empty());

        // WHEN: Calling getFoodEntryById with a non-existing id
        RuntimeException exeption = assertThrows(RuntimeException.class, () -> {
            foodEntryService.getFoodEntryById(1L);
        });

        // THEN: The exception message should indicate that the food entry was not found
        assertEquals("Food entry not found for id: 1", exeption.getMessage());
    }

    @DisplayName("Should save a food entry when saveFoodEntry is called")   
    @Test
    void shouldSaveAFoodEntryWhenSaveFoodEntryIsCalled() {
        testFoodEntry = createSampleFoodEntry();
        FoodEntryRequestDto foodEntryRequestDto = createSampleFoodEntryRequest();
        // GIVEN: the repository returns the food entry when saving
        when(userRepository.findById(1L)).thenReturn(Optional.of(testFoodEntry.getUser()));
        when(foodEntryRepository.save(any(FoodEntry.class))).thenReturn(testFoodEntry);

        // WHEN: calling saveFoodEntry
        FoodEntryResponseDto savedFoodEntry = foodEntryService.saveFoodEntry(foodEntryRequestDto);
        FoodEntryResponseDto expectedFoodEntry = createSampleFoodEntryResponse(testFoodEntry);
        
        // THEN: The returned food entry should match the expected food entry
        assertEquals(expectedFoodEntry, savedFoodEntry);

        // VERIFY: that the repository's save method was called with the correct food entry
        verify(foodEntryRepository).save(testFoodEntry);
    }

    @DisplayName("Should update a food entry when updateFoodEntry is called with existing id")
    @Test
    void shouldUpdateAFoodEntryWhenUpdateFoodEntryIsCalledWithExistingId() {

        testFoodEntry = createSampleFoodEntry();
        FoodEntryRequestDto foodEntryRequestDto = createSampleFoodEntryRequest();
        // GIVEN: The repository returns the original food entry for the given id
        when(foodEntryRepository.findById(1L)).thenReturn(Optional.of(testFoodEntry));
        when(foodEntryRepository.save(any(FoodEntry.class))).thenAnswer(invocation -> invocation.getArgument(0)); // Return the argument passed to save
        FoodEntryResponseDto expectedFoodEntry = createSampleFoodEntryResponse(testFoodEntry);

        // WHEN: calling updateFoodEntry
        FoodEntryResponseDto updatedFoodEntry = foodEntryService.updateFoodEntry(1L, foodEntryRequestDto);

        // THEN: The returned food entry should be the same as the expected food entry
        assertEquals(expectedFoodEntry, updatedFoodEntry);

        // VERIFY: Ensure foodEntryRepository.save() was called with the correct food entry and findById was called
        verify(foodEntryRepository).save(testFoodEntry);
        verify(foodEntryRepository).findById(1L);
    }

    @DisplayName("Should delete a food entry when deleteFoodEntry is called with existing id")
    @Test
    void shouldDeleteAFoodEntryWhenDeleteFoodEntryIsCalledWithExistingId() {
        // GIVEN: The repository does not throw an exception when deleting by id
        doNothing().when(foodEntryRepository).deleteById(1L);

        // WHEN: Calling deleteFoodEntryById
        foodEntryService.deleteFoodEntryById(1L);

        // VERIFY: Ensure foodEntryRepository.deleteById() was called with the correct id
        verify(foodEntryRepository).deleteById(1L);
    }

    @DisplayName("Should return the sum of calories for today when getCaloriesToday is called")
    @Test
    void shouldReturnSumOfCaloriesForTodayWhenGetCaloriesTodayIsCalled() {
        
        Long userId = 1L;
        Double expectedCalories = 500.0;

        //GIVEN: The repository returns the expected sum of calories for the given user and date
        when(foodEntryRepository.sumByCaloriesByUserIdAndDate(eq(userId), any())).thenReturn(expectedCalories);

        // WHEN: Calling getCaloriesToday
        Double actualCalories = foodEntryService.getCaloriesToday(userId, java.time.LocalDate.now());

        // THEN: The returned sum of calories should match the expected value
        assertEquals(expectedCalories, actualCalories);

        // VERIFY: Ensure that the repository's sumByCaloriesByUserIdAndDate method was called with the correct parameters
        verify(foodEntryRepository).sumByCaloriesByUserIdAndDate(eq(userId), any());
    }

    @DisplayName("Should return a list of food entries when getFoodEntriesByUserId is called with existing user id")
    @Test
    void shouldReturnListOfFoodEntriesWhenGetFoodEntriesByUserIdIsCalledWithExistingUserId() {
        // Arrange
        testFoodEntry = createSampleFoodEntry();
        Long userId = 1L;
        FoodEntryResponseDto testFoodEntryResponse = createSampleFoodEntryResponse(testFoodEntry);
        List<FoodEntryResponseDto> expectedFoodEntries = List.of(testFoodEntryResponse);
        List<FoodEntry> mockFoodEntries = List.of(testFoodEntry);

        // GIVEN: The repository returns a list of food entries for the given user id
        when(foodEntryRepository.findByUserIdOrderByDateDesc(userId)).thenReturn(mockFoodEntries);

        // WHEN: Calling getFoodEntriesByUserId
        List<FoodEntryResponseDto> actualFoodEntries = foodEntryService.getFoodEntriesByUserId(userId);

        // THEN: The returned list of food entries should match the expected list
        assertEquals(expectedFoodEntries, actualFoodEntries);

        // VERIFY: Ensure that the repository's findByUserIdOrderByDateDesc method was called with the correct user id
        verify(foodEntryRepository).findByUserIdOrderByDateDesc(userId);
    }
}
