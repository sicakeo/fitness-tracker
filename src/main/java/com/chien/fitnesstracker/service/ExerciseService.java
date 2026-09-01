package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.ExerciseRequestDto;
import com.chien.fitnesstracker.dto.ExerciseResponseDto;


public interface ExerciseService {
    ExerciseResponseDto getExercise(Long id);
    ExerciseResponseDto addExercise(ExerciseRequestDto exerciseRequestDto);
    void deleteExercise(Long id);
    ExerciseResponseDto updateExercise(Long id, ExerciseRequestDto exerciseDetails);
}
