package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.repository.WorkoutSessionRepository;
import com.chien.fitnesstracker.service.impl.WorkoutSessionServiceImpl;

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
public class WorkoutSessionServiceTest {

    @Mock
    private WorkoutSessionRepository workoutSessionRepository; // Simulated DB dependency

    @InjectMocks
    private WorkoutSessionServiceImpl workoutService; // Injects the mock repo into your real service

    private WorkoutSession testWorkoutSession;

    @BeforeEach
    void setUp() {
        testWorkoutSession = new WorkoutSession();
        testWorkoutSession.setTitle("Test workout session");
        testWorkoutSession.setDate(java.time.LocalDate.now());
    }

    @DisplayName("Should save a session when saveSession is called")
    @Test
    void shouldSaveASessionWhenSaveSessionIsCalled() {
        // GIVEN: The repository return a workout
        when(workoutSessionRepository.save(testWorkoutSession)).thenReturn(testWorkoutSession);

        //THEN: Calling saveWorkout
        WorkoutSession result = workoutService.saveSession(testWorkoutSession);

        //THEN: The returned workout should be the same as testWorkout
        assertEquals(testWorkoutSession, result);

        //VERIFY: : Ensure workoutRepository.save() was called with the correct workout
        verify(workoutSessionRepository).save(testWorkoutSession);
    }

    @DisplayName("Should delete when deleteSession is called with existing id")
    @Test
    void shouldDeleteASessionWhenDeleteSessionIsCalledWithExistingId() {
        // GIVEN:  The repository does not throw an exception when deleting by id
        doNothing().when(workoutSessionRepository).deleteById(1L);

        //WHEN: Calling deleteSessionById should throw a RuntimeException
        workoutService.deleteSessionById(1L);

        //VERIFY: Ensure workoutSessionRepository.deleteById() was call with existing id
        verify(workoutSessionRepository).deleteById(1L);
    }

    @DisplayName("Should update session when updateSession is called with existing id")
    @Test
    void shouldUpdateSessionWhenUpdateSessionIsCalledWithExistingId() {
        // GIVEN: The repository returns a session for the given id
        when(workoutSessionRepository.findById(1L)).thenReturn(java.util.Optional.of(testWorkoutSession));

        // Tell Mockito to return whatever object is passed into save(...)
        when(workoutSessionRepository.save(any(WorkoutSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Calling updateSession
       WorkoutSession updatedSession = new WorkoutSession();
       updatedSession.setId(1L); // Ensure the ID matches the existing workout
       updatedSession.setTitle("Updated workout session");
       updatedSession.setDate(java.time.LocalDate.now());
       WorkoutSession result = workoutService.updateSession(1L, updatedSession);

       // THEN: The returned workout should have the updated intensity
       assertEquals(updatedSession.getTitle(), result.getTitle());

        // VERIFY: Ensure workoutSessionRepository.save() was called with the updated session
        verify(workoutSessionRepository, times(1)).save(any(WorkoutSession.class));
        verify(workoutSessionRepository, times(1)).findById(1L);
    }

    @DisplayName("Should return the sum of calories burned today for a user when getCaloriesToday is called")
    @Test
    void shouldReturnSumOfCaloriesBurnedTodayForUserWhenGetCaloriesTodayIsCalled() {
        // GIVEN: The repository returns a sum of calories for the given user and date
        Long userId = 1L;
        java.time.LocalDate date = java.time.LocalDate.now();
        Double expectedCalories = 500.0;
        when(workoutSessionRepository.sumByCaloriesByUserIdAndDate(userId, date)).thenReturn(expectedCalories);

        // WHEN: Calling getCaloriesToday
        Double result = workoutService.getCaloriesToday(userId, date);

        // THEN: The returned value should be the expected sum of calories
        assertEquals(expectedCalories, result);
    }

    @DisplayName("Should return a list of workout sessions for a user when getSessionsByUserId is called")
    @Test
    void shouldReturnListOfSessionsForUserWhenGetSessionsByUserIdIsCalled() {
        // GIVEN: The repository returns a list of workouts for the given user
        Long userId = 1L;
        List<WorkoutSession> mockWorkoutSessions = List.of(testWorkoutSession);
        when(workoutSessionRepository.findSessionsByUserIdOrderByDateDesc(userId)).thenReturn(mockWorkoutSessions);

        // WHEN: Calling getSessionsByUserId
        List<WorkoutSession> result = workoutService.getSessionsByUserId(userId);

        // THEN: The returned list should contain the expected workouts
        assertEquals(mockWorkoutSessions, result);
    }
}
