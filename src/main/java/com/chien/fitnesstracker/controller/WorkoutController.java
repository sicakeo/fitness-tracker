package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.model.Workout;
import com.chien.fitnesstracker.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {
    private final WorkoutService workoutService;
    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping
    public List<Workout> getWorkouts(){
        return workoutService.getAllWorkouts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getFoodEntryById(@PathVariable Long id){
        return ResponseEntity.ok(workoutService.getWorkoutById(id));
    }

    @PostMapping
    public ResponseEntity<Workout> addWorkout(@Valid @RequestBody Workout workout){
        return ResponseEntity.ok(workoutService.saveWorkout(workout));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(@PathVariable Long id, @Valid @RequestBody Workout workout){
        return ResponseEntity.ok(workoutService.updateWorkout(id ,workout));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id){
        workoutService.deleteWorkoutById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/today-calories")
    public ResponseEntity<Double> getWorkoutsByDate(@RequestParam Long userId,@RequestParam String date){
        java.time.LocalDate localDate = java.time.LocalDate.parse(date);
        Double totalCalories = workoutService.getCaloriesToday(userId, localDate);
        return ResponseEntity.ok(totalCalories);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Workout>> getWorkoutHistory(@RequestParam Long userId){
        List<Workout> workouts= workoutService.getWorkoutsByUserId(userId);
        return ResponseEntity.ok(workouts);
    }
}
