package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Exercise;


public interface ExerciseService {
    Exercise getExercise(Long id);
    Exercise addExercise(Exercise exercise);
    void deleteExercise(Long id);
    Exercise updateExercise(Long id, Exercise exerciseDetails);
}
