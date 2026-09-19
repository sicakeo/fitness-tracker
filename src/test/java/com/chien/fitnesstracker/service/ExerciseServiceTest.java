package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.Exercise.ExerciseRequestDto;
import com.chien.fitnesstracker.dto.Exercise.ExerciseResponseDto;
import com.chien.fitnesstracker.model.Exercise;
import com.chien.fitnesstracker.model.enums.ExerciseType;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.repository.ExerciseRepository;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.service.impl.ExerciseServiceImpl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.util.Optional;


@ExtendWith(MockitoExtension.class)
public class ExerciseServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository; // Simulated DB dependency

    @Mock 
    private UserRepository userRepository; // Simulated DB dependency

    @InjectMocks
    private ExerciseServiceImpl exerciseService; // Injects the mock repo into your real service

    private Exercise testExercise;

    

    private Exercise createSampleExercise() {
        Exercise exercise = new Exercise();
        exercise.setName("Test Exercise");
        exercise.setExerciseType(ExerciseType.HIIT_CARDIO);
        exercise.setMet(8.0);
        exercise.setUser(new User());   
        return exercise;
    }

    private ExerciseRequestDto createSampleExerciseRequest() {
        return new ExerciseRequestDto(
                1L, // userId
                "Test Exercise",
                ExerciseType.HIIT_CARDIO,
                8.0
        );
    }

    private ExerciseResponseDto createSampleExerciseResponse(Exercise exercise) {
        return new ExerciseResponseDto(
                exercise.getId(),
                exercise.getUser().getId(),
                exercise.getName(),
                exercise.getExerciseType(),
                exercise.getMet()
        );
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

        testExercise = createSampleExercise();

        ExerciseRequestDto testExerciseRequest = createSampleExerciseRequest();
        //GIVEN: The repository returns exercise when saving
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User())); // Mock user retrieval
        when(exerciseRepository.save(testExercise)).thenReturn(testExercise);
        //WHEN: Calling addExercise
        ExerciseResponseDto result = exerciseService.addExercise(testExerciseRequest);

        //THEN: The returned exercise should be the same as test exercise
        assertEquals(createSampleExerciseResponse(testExercise), result);

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

        testExercise = createSampleExercise();
        // GIVEN: The repository returns the original exercise
        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));

        // Tell Mockito to return whatever object is passed into save(...)
        when(exerciseRepository.save(any(Exercise.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Preparing update details and calling service
        ExerciseRequestDto testExerciseRequest = createSampleExerciseRequest();
        testExerciseRequest = new ExerciseRequestDto(
                testExerciseRequest.userId(),
                "Updated Name",
                ExerciseType.CORE_STRENGTH,
                5.0
        );
        ExerciseResponseDto result = exerciseService.updateExercise(1L, testExerciseRequest);

        // THEN: Verify that the result actually reflects the NEW values
        assertNotNull(result);
        assertEquals("Updated Name", result.name());
        assertEquals(ExerciseType.CORE_STRENGTH, result.exerciseType());
        assertEquals(5.0, result.met());

        // VERIFY: Ensure findById and save were executed
        verify(exerciseRepository, times(1)).findById(1L); 
        verify(exerciseRepository, times(1)).save(testExercise);
    }
}