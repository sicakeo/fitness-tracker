package com.chien.fitnesstracker.service.impl;

import com.chien.fitnesstracker.model.Exercise;
import com.chien.fitnesstracker.repository.ExerciseRepository;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.service.ExerciseService;
import com.chien.fitnesstracker.dto.ExerciseRequestDto;
import com.chien.fitnesstracker.dto.ExerciseResponseDto;

import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class ExerciseServiceImpl implements ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ExerciseServiceImpl(ExerciseRepository ExerciseRepository, UserRepository UserRepository) {
        this.exerciseRepository = ExerciseRepository;
        this.userRepository = UserRepository;
    }

    @Override
    public ExerciseResponseDto getExercise(Long id) {
        Optional<Exercise> optional = exerciseRepository.findById(id);
        Exercise exercise;
        if (optional.isPresent()) exercise = optional.get();
        else throw new RuntimeException("Exercise not found for id: " + id);
        return mapToResponseDto(exercise);
    }

    @Override
    public ExerciseResponseDto addExercise(ExerciseRequestDto exerciseRequestDto) {
        Exercise exercise = new Exercise();
        exercise.setUser(userRepository.findById(exerciseRequestDto.userId()).orElseThrow(() -> new RuntimeException("User not found")));
        exercise.setName(exerciseRequestDto.name());
        exercise.setExerciseType(exerciseRequestDto.exerciseType());
        exercise.setMet(exerciseRequestDto.met());
        return mapToResponseDto(exerciseRepository.save(exercise));
    }

    @Override
    public void deleteExercise(Long id) {
        this.exerciseRepository.deleteById(id);
    }

    @Override
    public ExerciseResponseDto updateExercise(Long id, ExerciseRequestDto exerciseDetails) {
       Optional<Exercise> exerciseOptional = exerciseRepository.findById(id);
       if (!exerciseOptional.isPresent()) {
           throw new RuntimeException("Exercise not found for id: " + id);
       }
       
       Exercise exercise = exerciseOptional.get();
       exercise.setName(exerciseDetails.name());
       exercise.setExerciseType(exerciseDetails.exerciseType());
       exercise.setMet(exerciseDetails.met());
       return mapToResponseDto(exerciseRepository.save(exercise));
    }

    private ExerciseResponseDto mapToResponseDto(Exercise exercise) {
        return new ExerciseResponseDto(
                exercise.getId(),
                exercise.getUser().getId(),
                exercise.getName(),
                exercise.getExerciseType(),
                exercise.getMet()
        );
    }
}
