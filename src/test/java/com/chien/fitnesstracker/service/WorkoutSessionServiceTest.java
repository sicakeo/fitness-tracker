package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.WorkoutSession.WorkoutSessionRequestDto;
import com.chien.fitnesstracker.dto.WorkoutSession.WorkoutSessionResponseDto;
import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.repository.WorkoutSessionRepository;
import com.chien.fitnesstracker.service.impl.WorkoutSessionServiceImpl;
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

    @Mock
    private UserRepository userRepository; // Simulated DB dependency

    @InjectMocks
    private WorkoutSessionServiceImpl workoutService; // Injects the mock repo into your real service

    private WorkoutSession testWorkoutSession;


    private WorkoutSession createSampleWorkoutSession() {
        WorkoutSession workoutSession = new WorkoutSession();
        workoutSession.setTotalDurationMinutes(60);
        workoutSession.setTotalCaloriesBurned(500.0);
        workoutSession.setTitle("Test workout session");
        workoutSession.setDate(java.time.LocalDate.now());
        return workoutSession;
    }


    private WorkoutSessionRequestDto createSampleWorkoutSessionRequest() {
        return new WorkoutSessionRequestDto(
                1L, // userId
                "Test workout session",
                java.time.LocalDate.now(),
                60, // totalDurationMinutes
                500.0, // totalCaloriesBurned
                List.of() // entries
        );
    }

    private WorkoutSessionResponseDto createSampleWorkoutSessionResponse(WorkoutSession workoutSession) {
        return new WorkoutSessionResponseDto(
                workoutSession.getId(),
                workoutSession.getUser().getId(),
                workoutSession.getTitle(),
                workoutSession.getDate(),
                workoutSession.getTotalDurationMinutes(),
                workoutSession.getTotalCaloriesBurned(),
                List.of() // entries
        );
    }

    @DisplayName("Should save a session when saveSession is called")
    @Test
    void shouldSaveASessionWhenSaveSessionIsCalled() {

        // GIVEN: A sample workout session and request
        testWorkoutSession = createSampleWorkoutSession();
        testWorkoutSession.setUser(new com.chien.fitnesstracker.model.User()); // Set a user for the session
        WorkoutSessionResponseDto testWorkoutSessionExpected = createSampleWorkoutSessionResponse(testWorkoutSession);
        WorkoutSessionRequestDto testWorkoutSessionRequest = createSampleWorkoutSessionRequest();

        // GIVEN: The repository return a workout when saving
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(new com.chien.fitnesstracker.model.User()));
        when(workoutSessionRepository.save(any(WorkoutSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        //THEN: Calling saveWorkout
        WorkoutSessionResponseDto result = workoutService.saveSession(testWorkoutSessionRequest);

        //THEN: The returned workout should be the same as testWorkout
        assertEquals(testWorkoutSessionExpected, result);

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
        testWorkoutSession = createSampleWorkoutSession();
        // GIVEN: The repository returns a session for the given id
        when(workoutSessionRepository.findById(1L)).thenReturn(java.util.Optional.of(testWorkoutSession));

        // Tell Mockito to return whatever object is passed into save(...)
        when(workoutSessionRepository.save(any(WorkoutSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN: Calling updateSession
       WorkoutSessionRequestDto updatedSessionRequest = createSampleWorkoutSessionRequest();
       updatedSessionRequest = new WorkoutSessionRequestDto(
                updatedSessionRequest.userId(),
                "Updated Title",
                updatedSessionRequest.date(),
                updatedSessionRequest.totalDurationMinutes(),
                updatedSessionRequest.totalCaloriesBurned(),
                updatedSessionRequest.entries()
        );
       WorkoutSessionResponseDto result = workoutService.updateSession(1L, updatedSessionRequest);

        // THEN: The returned session should have the updated title
        assertEquals(updatedSessionRequest.title(), result.title());

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

        //GIVEN: The repository returns the expected sum of calories
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
        testWorkoutSession = createSampleWorkoutSession();
        testWorkoutSession.setUser(new com.chien.fitnesstracker.model.User()); // Set a user for the session
        Long userId = 1L;
        WorkoutSessionResponseDto testWorkoutSession = createSampleWorkoutSessionResponse(this.testWorkoutSession);
        List<WorkoutSessionResponseDto> mockWorkoutSessions = List.of(testWorkoutSession);

        //GIVEN: The repository returns the expected list of workouts
        when(workoutSessionRepository.findSessionsByUserIdOrderByDateDesc(userId)).thenReturn(List.of(this.testWorkoutSession));

        // WHEN: Calling getSessionsByUserId
        List<WorkoutSessionResponseDto> result = workoutService.getSessionsByUserId(userId);

        // THEN: The returned list should contain the expected workouts
        assertEquals(mockWorkoutSessions, result);
    }
}
