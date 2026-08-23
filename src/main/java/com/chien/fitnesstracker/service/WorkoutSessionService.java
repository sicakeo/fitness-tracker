package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.model.WorkoutSession;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionService {
    WorkoutSession getSessionById(Long id);
    WorkoutSession saveSession(WorkoutSession workoutSession);
    void deleteSessionById(Long id);
    WorkoutSession updateSession(Long id, WorkoutSession workoutSessionDetails);
    Double getCaloriesToday(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<WorkoutSession> getSessionsByUserId(Long userId);
}
