package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Exercise;

import java.util.List;

public interface ExerciseService {
    List<Exercise> getExercises();
    Exercise getExercise(Long id);
    Exercise addExercise(Exercise exercise);
    void deleteExercise(Long id);
    Exercise updateExercise(Long id, Exercise exerciseDetails);
}
