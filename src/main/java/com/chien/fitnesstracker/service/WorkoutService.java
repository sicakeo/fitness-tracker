package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Workout;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutService {
    List<Workout> getAllWorkouts();
    Workout getWorkoutById(Long id);
    Workout saveWorkout(Workout workout);
    void deleteWorkoutById(Long id);
    Workout updateWorkout(Long id, Workout workoutDetails);
    Double getCaloriesToday(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<Workout> getWorkoutsByUserId(Long userId);
}
