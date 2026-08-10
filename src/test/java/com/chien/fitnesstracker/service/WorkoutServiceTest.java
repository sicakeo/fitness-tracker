package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Workout;
import com.chien.fitnesstracker.repository.WorkoutRepository;
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


@ExtendWith(MockitoExtension.class)
public class WorkoutServiceTest {

    @Mock
    private WorkoutRepository workoutRepository; // Simulated DB dependency

    @InjectMocks
    private WorkoutServiceImpl workoutService; // Injects the mock repo into your real service

    private Workout testWorkout;

    @BeforeEach
    void setUp() {
        testWorkout = new Workout();
        testWorkout.setDuration(30);
        testWorkout.setIntensity("Moderate");
    }

    @DisplayName("Should return a list of workouts when getAllWorkouts is called")
    @Test
    void shouldReturnAllWorkouts() {
        // Test implementation here
        // GIVEN: The repository returns a list of workouts
        List<Workout> mockWorkouts = List.of(testWorkout);
        when(workoutRepository.findAll()).thenReturn(mockWorkouts);

        // WHEN: Calling getAllWorkouts
        List<Workout> result = workoutService.getAllWorkouts();

        // THEN: The returned list should contain the expected workouts
        assertEquals(mockWorkouts, result);
    }

    @DisplayName("Should throw RuntimeException when getWorkoutById is called with non-existing id")
    @Test
    void shouldThrowRuntimeExceptionWhenGetWorkoutByIdIsCalledWithNonExistingId() {
        // GIVEN: The repository returns an empty Optional for the given id
        when(workoutRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        //WHEN & THEN: Calling getWorkoutById should throw a RuntimeException
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> workoutService.getWorkoutById(1L));
        
        assertEquals("Workout with id 1 not found", exception.getMessage());
    }

    @DisplayName("Should save a workout when saveWorkout is called")
    @Test
    void shouldSaveAWorkoutWhenSaveWorkoutIsCalled() {
        // GIVEN: The repository return a workout
        when(workoutRepository.save(testWorkout)).thenReturn(testWorkout);

        //THEN: Calling saveWorkout
        Workout result = workoutService.saveWorkout(testWorkout);

        //THEN: The returned workout should be the same as testWorkout
        assertEquals(testWorkout, result);

        //VERIFY: : Ensure workoutRepository.save() was called with the correct workout
        verify(workoutRepository).save(testWorkout);
    }

    @DisplayName("Should delete when deleteWorkout is called with existing id")
    @Test
    void shouldDeleteAWorkoutWhenDeleteWorkoutIsCalledWithExistingId() {
        // GIVEN:  The repository does not throw an exception when deleting by id
        doNothing().when(workoutRepository).deleteById(1L);

        //WHEN: Calling deleteWorkout should throw a RuntimeException
        workoutService.deleteWorkoutById(1L);

        //VERIFY: Ensure workoutRepository.deleteById() was call with existing id
        verify(workoutRepository).deleteById(1L);
    }

    @DisplayName("Should update workout when updateWorkout is called with existing id")
    @Test
    void shouldUpdateWorkoutWhenUpdateWorkoutIsCalledWithExistingId() {
        // GIVEN: The repository returns a workout for the given id
        when(workoutRepository.findById(1L)).thenReturn(java.util.Optional.of(testWorkout));

        // Tell Mockito to return whatever object is passed into save(...)
        when(workoutRepository.save(any(Workout.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Calling updateWorkout
        Workout updatedWorkout = new Workout();
        updatedWorkout.setIntensity("Moderate");
        updatedWorkout.setId(1L); // Ensure the ID matches the existing workout
        Workout result = workoutService.updateWorkout(1L, updatedWorkout);

        // THEN: The returned workout should have the updated intensity
        assertEquals(updatedWorkout.getIntensity(), result.getIntensity());

        // VERIFY: Ensure workoutRepository.save() was called with the updated workout
        verify(workoutRepository, times(1)).save(any(Workout.class));
        verify(workoutRepository, times(1)).findById(1L);
    }

    @DisplayName("Should return the sum of calories burned today for a user when getCaloriesToday is called")
    @Test
    void shouldReturnSumOfCaloriesBurnedTodayForUserWhenGetCaloriesTodayIsCalled() {
        // GIVEN: The repository returns a sum of calories for the given user and date
        Long userId = 1L;
        java.time.LocalDate date = java.time.LocalDate.now();
        Double expectedCalories = 500.0;
        when(workoutRepository.sumByCaloriesByUserIdAndDate(userId, date)).thenReturn(expectedCalories);

        // WHEN: Calling getCaloriesToday
        Double result = workoutService.getCaloriesToday(userId, date);

        // THEN: The returned value should be the expected sum of calories
        assertEquals(expectedCalories, result);
    }

    @DisplayName("Should return a list of workouts for a user when getWorkoutsByUserId is called")
    @Test
    void shouldReturnListOfWorkoutsForUserWhenGetWorkoutsByUserIdIsCalled() {
        // GIVEN: The repository returns a list of workouts for the given user
        Long userId = 1L;
        List<Workout> mockWorkouts = List.of(testWorkout);
        when(workoutRepository.findByUserIdOrderByDateDesc(userId)).thenReturn(mockWorkouts);

        // WHEN: Calling getWorkoutsByUserId
        List<Workout> result = workoutService.getWorkoutsByUserId(userId);

        // THEN: The returned list should contain the expected workouts
        assertEquals(mockWorkouts, result);
    }
}
