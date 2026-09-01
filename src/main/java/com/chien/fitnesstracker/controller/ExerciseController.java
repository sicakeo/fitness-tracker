package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.dto.Exercise.ExerciseRequestDto;
import com.chien.fitnesstracker.dto.Exercise.ExerciseResponseDto;
import com.chien.fitnesstracker.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController{
    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseResponseDto> getExercise(@PathVariable Long id){
        return ResponseEntity.ok(exerciseService.getExercise(id));
    }

    @PostMapping
    public ResponseEntity<ExerciseResponseDto> createExercise(@Valid @RequestBody ExerciseRequestDto exercise){
        return ResponseEntity.status(201).body(exerciseService.addExercise(exercise));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseResponseDto> updateExercise(@Valid @RequestBody ExerciseRequestDto exercise, @PathVariable Long id){
        return ResponseEntity.ok(exerciseService.updateExercise(id, exercise));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id){
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }
}
