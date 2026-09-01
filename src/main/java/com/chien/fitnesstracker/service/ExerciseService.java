package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.Exercise.ExerciseRequestDto;
import com.chien.fitnesstracker.dto.Exercise.ExerciseResponseDto;


public interface ExerciseService {
    ExerciseResponseDto getExercise(Long id);
    ExerciseResponseDto addExercise(ExerciseRequestDto exerciseRequestDto);
    void deleteExercise(Long id);
    ExerciseResponseDto updateExercise(Long id, ExerciseRequestDto exerciseDetails);
}
