package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.FoodEntry;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.repository.FoodEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;


@ExtendWith(MockitoExtension.class)
public class FoodEntryServiceTest {

    @Mock
    private FoodEntryRepository foodEntryRepository; // Simulated DB dependency

    @InjectMocks
    private FoodEntryServiceImpl foodEntryService; // Injects the mock repo into your real service

    private FoodEntry testFoodEntry;

    @BeforeEach
    void setUp() {
        testFoodEntry = new FoodEntry();
        testFoodEntry.setName("Test Food");
        testFoodEntry.setCalories(100.0);
        testFoodEntry.setFat(5.0);
        testFoodEntry.setProtein(10.0);
        testFoodEntry.setCarb(15.0);
        testFoodEntry.setUser(new User());  
    }

    @DisplayName("Should return a list of food entries when getFoodEntries is called")
    @Test
    void shouldReturnAllFoodEntries() {
        // Arrange
        List<FoodEntry> mockFoodEntries = List.of(testFoodEntry);
        when(foodEntryRepository.findAll()).thenReturn(mockFoodEntries);

        // Act
        List<FoodEntry> actualFoodEntries = foodEntryService.getFoodEntries();

        // Assert
        assertEquals(mockFoodEntries, actualFoodEntries);
    }


    @DisplayName("Should throw RuntimeException when getFoodEntryById is called with non-existing id")
    @Test
    void shouldThrowRuntimeExceptionWhenGetFoodEntryByIdIsCalledWithNonExistingId() {
        // Arrange

        when(foodEntryRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exeption = assertThrows(RuntimeException.class, () -> {
            foodEntryService.getFoodEntryById(1L);
        });

        assertEquals("Food entry not found for id: 1", exeption.getMessage());
    }

    @DisplayName("Should save a food entry when saveFoodEntry is called")   
    @Test
    void shouldSaveAFoodEntryWhenSaveFoodEntryIsCalled() {
        // Arrange
        when(foodEntryRepository.save(any(FoodEntry.class))).thenReturn(testFoodEntry);

        // Act
        FoodEntry savedFoodEntry = foodEntryService.saveFoodEntry(testFoodEntry);

        // Assert
        assertEquals(testFoodEntry, savedFoodEntry);

        // Verify that the repository's save method was called with the correct food entry
        verify(foodEntryRepository).save(testFoodEntry);
    }

    @DisplayName("Should update a food entry when updateFoodEntry is called with existing id")
    @Test
    void shouldUpdateAFoodEntryWhenUpdateFoodEntryIsCalledWithExistingId() {
        // Arrange
        when(foodEntryRepository.findById(1L)).thenReturn(Optional.of(testFoodEntry));
        when(foodEntryRepository.save(any(FoodEntry.class))).thenAnswer(invocation -> invocation.getArgument(0)); // Return the argument passed to save

        // Act
        FoodEntry updatedFoodEntry = foodEntryService.updateFoodEntry(1L, testFoodEntry);

        // Assert
        assertEquals(testFoodEntry, updatedFoodEntry);

        // Verify that the repository's save method was called with the correct food entry
        verify(foodEntryRepository).save(testFoodEntry);
        verify(foodEntryRepository).findById(1L);
    }

    @DisplayName("Should delete a food entry when deleteFoodEntry is called with existing id")
    @Test
    void shouldDeleteAFoodEntryWhenDeleteFoodEntryIsCalledWithExistingId() {
        // Arrange
        doNothing().when(foodEntryRepository).deleteById(1L);

        // Act
        foodEntryService.deleteFoodEntryById(1L);

        // Assert
        verify(foodEntryRepository).deleteById(1L);
    }

    @DisplayName("Should return the sum of calories for today when getCaloriesToday is called")
    @Test
    void shouldReturnSumOfCaloriesForTodayWhenGetCaloriesTodayIsCalled() {
        // Arrange
        Long userId = 1L;
        Double expectedCalories = 500.0;
        when(foodEntryRepository.sumByCaloriesByUserIdAndDate(eq(userId), any())).thenReturn(expectedCalories);

        // Act
        Double actualCalories = foodEntryService.getCaloriesToday(userId, java.time.LocalDate.now());

        // Assert
        assertEquals(expectedCalories, actualCalories);

        // Verify that the repository's sumByCaloriesByUserIdAndDate method was called with the correct parameters
        verify(foodEntryRepository).sumByCaloriesByUserIdAndDate(eq(userId), any());
    }

    @DisplayName("Should return a list of food entries when getFoodEntriesByUserId is called with existing user id")
    @Test
    void shouldReturnListOfFoodEntriesWhenGetFoodEntriesByUserIdIsCalledWithExistingUserId() {
        // Arrange
        Long userId = 1L;
        List<FoodEntry> mockFoodEntries = List.of(testFoodEntry);
        when(foodEntryRepository.findByUserIdOrderByDateDesc(userId)).thenReturn(mockFoodEntries);

        // Act
        List<FoodEntry> actualFoodEntries = foodEntryService.getFoodEntriesByUserId(userId);

        // Assert
        assertEquals(mockFoodEntries, actualFoodEntries);

        // Verify that the repository's findByUserIdOrderByDateDesc method was called with the correct user id
        verify(foodEntryRepository).findByUserIdOrderByDateDesc(userId);
    }
}
