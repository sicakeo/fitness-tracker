package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Workout;

import java.util.List;

public interface WorkoutService {
    List<Workout> getAllWorkouts();
    Workout getWorkoutById(Long id);
    Workout saveWorkout(Workout workout);
    void deleteWorkoutById(Long id);
    Workout updateWorkout(Long id, Workout workoutDetails);
}
