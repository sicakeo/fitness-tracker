package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workout-sessions")
public class WorkoutSessionController {
    private final WorkoutSessionService sessionService;
    public WorkoutSessionController(WorkoutSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSession> getSessionById(@PathVariable Long id){
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }
    
    @PostMapping
    public ResponseEntity<WorkoutSession> createSession(@Valid @RequestBody WorkoutSession session) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.saveSession(session));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutSession> updateSession(@PathVariable Long id, @Valid @RequestBody WorkoutSession workoutSession){
        return ResponseEntity.ok(sessionService.updateSession(id , workoutSession));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id){
        sessionService.deleteSessionById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/today-calories")
    public ResponseEntity<Double> getSessionsByDate(@RequestParam Long userId,@RequestParam String date){
        java.time.LocalDate localDate = java.time.LocalDate.parse(date);
        Double totalCalories = sessionService.getCaloriesToday(userId, localDate);
        return ResponseEntity.ok(totalCalories);
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutSession>> getWorkoutHistory(@RequestParam Long userId){
        List<WorkoutSession> workoutSessions = sessionService.getSessionsByUserId(userId);
        return ResponseEntity.ok(workoutSessions);
    }
}
