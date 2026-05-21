package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.Exercise;
import com.chien.fitnesstracker.repository.ExerciseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseServiceImpl implements ExerciseService {
    private final ExerciseRepository exerciseRepository;

    public ExerciseServiceImpl(ExerciseRepository ExerciseRepository) {
        this.exerciseRepository = ExerciseRepository;
    }

    @Override
    public List<Exercise> getExercises() {
        return this.exerciseRepository.findAll();
    }

    @Override
    public Exercise getExercise(Long id) {
        Optional<Exercise> optional = exerciseRepository.findById(id);
        Exercise exercise;
        if (optional.isPresent()) exercise = optional.get();
        else throw new RuntimeException("Exercise not found for id: " + id);
        return exercise;
    }

    @Override
    public Exercise addExercise(Exercise exercise) {
        return this.exerciseRepository.save(exercise);
    }

    @Override
    public void deleteExercise(Long id) {
        this.exerciseRepository.deleteById(id);
    }

    @Override
    public Exercise updateExercise(Long id, Exercise exerciseDetails) {
        Exercise exercise = getExercise(id);

        exercise.setName(exerciseDetails.getName());
        exercise.setReps(exerciseDetails.getReps());
        exercise.setSets(exerciseDetails.getSets());
        exercise.setWorkout(exerciseDetails.getWorkout());
        exercise.setWeight(exerciseDetails.getWeight());
        return exerciseRepository.save(exercise);
    }
}
