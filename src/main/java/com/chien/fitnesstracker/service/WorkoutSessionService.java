package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.WorkoutSession.WorkoutSessionRequestDto;
import com.chien.fitnesstracker.dto.WorkoutSession.WorkoutSessionResponseDto;

import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutSessionService {
    WorkoutSessionResponseDto getSessionById(Long id);
    WorkoutSessionResponseDto saveSession(WorkoutSessionRequestDto workoutSession);
    void deleteSessionById(Long id);
    WorkoutSessionResponseDto updateSession(Long id, WorkoutSessionRequestDto workoutSessionDetails);
    Double getCaloriesToday(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<WorkoutSessionResponseDto> getSessionsByUserId(Long userId);
}
