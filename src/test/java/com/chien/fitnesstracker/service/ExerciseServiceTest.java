package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Exercise;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.repository.ExerciseRepository;
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
public class ExerciseServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository; // Simulated DB dependency

    @InjectMocks
    private ExerciseServiceImpl exerciseService; // Injects the mock repo into your real service

    private Exercise testExercise;

    @BeforeEach
    void setUp() {
        testExercise = new Exercise();
        User testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testExercise.setName("Push-up");
        testExercise.setWorkoutType("Weightlifting");
        testExercise.setUser(testUser);
    }

    @Test
    @DisplayName("Should give a list of exercises when getExercises is called")
    void shouldGiveAListOfExercisesWhenGetExercisesIsCalled() {
        // Implementation for this test case

        // GIVEN: The repository returns a list of exercises
        List<Exercise> mockExercises = List.of(testExercise);
        when(exerciseRepository.findAll()).thenReturn(mockExercises);

        // WHEN: Calling getExercises
        List<Exercise> result = exerciseService.getExercises();

        // THEN: The returned list should contain the expected exercises
        assertEquals(mockExercises, result);
    }

    @Test
    @DisplayName("Should throw RuntimeException when getExerciseById is called with non-existing id")
    void shouldThrowRuntimeExceptionWhenGetExerciseByIdIsCalledWithNonExistingId() {
        //GIVEN: The repository returns an empty Optional for the given id
        when(exerciseRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        //WHEN & THEN: Calling getExercise should throw a RuntimeException  
        RuntimeException exception = assertThrows(RuntimeException.class, ()->exerciseService.getExercise(1L));

        //THEN: The exception message should indicate that the exercise was not found
        assertEquals("Exercise not found for id: 1", exception.getMessage());
    }

    @Test
    @DisplayName("Should save Exercise when addExercise is called")
    void shouldSaveExerciseWhenSaveExerciseIsCalled() {
        //GIVEN: The repository returns exercise when saving
        when(exerciseRepository.save(testExercise)).thenReturn(testExercise);

        //WHEN: Calling addExercise
        Exercise result = exerciseService.addExercise(testExercise);

        //THEN: The returned exercise should be the same as test exercise
        assertEquals(testExercise, result);

        //VERIFY: Ensure exerciseRepository.save() was called with the correct Exercise
        verify(exerciseRepository).save(testExercise);
    }

    @Test
    @DisplayName("Should delete Exercise when deleteExercise is called with existing id")
    void shouldDeleteExerciseWhenDeleteExerciseIsCalledWithExistingId() {
        //GIVEN:
        doNothing().when(exerciseRepository).deleteById(1L);
        
        //WHEN:
        exerciseService.deleteExercise(1L);
    
        //VERIFY:
         verify(exerciseRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should update Exercise when updateExercise is called with existing id")
    void shouldUpdateExerciseWhenUpdateExerciseIsCalledWithExistingId() {
        // GIVEN: The repository returns the original exercise
        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));

        // Tell Mockito to return whatever object is passed into save(...)
        when(exerciseRepository.save(any(Exercise.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Preparing update details and calling service
        Exercise updatedDetails = new Exercise();
        updatedDetails.setName("Updated Name");
        updatedDetails.setWorkoutType("Updated Type");
        updatedDetails.setMet(5.0);

        Exercise result = exerciseService.updateExercise(1L, updatedDetails);

        // THEN: Verify that the result actually reflects the NEW values
        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Type", result.getWorkoutType());
        assertEquals(5.0, result.getMet());

        // VERIFY: Ensure findById and save were executed
        verify(exerciseRepository, times(1)).findById(1L);
        verify(exerciseRepository, times(1)).save(testExercise);
    }
}