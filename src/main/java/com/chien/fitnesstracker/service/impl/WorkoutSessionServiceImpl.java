package com.chien.fitnesstracker.service.impl;

import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.model.WorkoutEntry;
import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.repository.ExerciseRepository;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.repository.WorkoutSessionRepository;
import com.chien.fitnesstracker.service.WorkoutSessionService;
import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import com.chien.fitnesstracker.dto.*;

@Service
public class WorkoutSessionServiceImpl implements WorkoutSessionService {
    private final WorkoutSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutSessionServiceImpl(WorkoutSessionRepository workoutSessionRepository
                , UserRepository userRepository, ExerciseRepository exerciseRepository) {
        this.sessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public WorkoutSessionResponseDto getSessionById(Long id) {
        Optional<WorkoutSession> optional = sessionRepository.findById(id);
        WorkoutSession workoutSession;
        if (optional.isPresent()) workoutSession = optional.get();
        else throw new ResourceNotFoundException("Workout session not found for id: " + id);
        return mapToResponseDto(workoutSession);
    }

    @Override
    public List<WorkoutSessionResponseDto> getSessionsByUserId(Long userId) {
        List<WorkoutSession> sessions = sessionRepository.findSessionsByUserIdOrderByDateDesc(userId);
        if (sessions.isEmpty()) {
            throw new ResourceNotFoundException("No workout sessions found for userId: " + userId);
        }
        return sessions.stream().map(this::mapToResponseDto).toList();
    }

    @Override
    public WorkoutSessionResponseDto saveSession(WorkoutSessionRequestDto sessionRequestDto) {
        Optional<User> userOptional = userRepository.findById(sessionRequestDto.userId());
        if (!userOptional.isPresent()) {
            throw new ResourceNotFoundException("User not found for id: " + sessionRequestDto.userId());
        }

        User user = userOptional.get();
        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setTitle(sessionRequestDto.title());
        session.setDate(sessionRequestDto.date());
        session.setTotalDurationMinutes(sessionRequestDto.totalDurationMinutes());
        session.setTotalCaloriesBurned(sessionRequestDto.totalCaloriesBurned());
        session.setEntries(sessionRequestDto.entries().stream()
                .map(entryDto -> {
                    var exercise = exerciseRepository.findById(entryDto.exerciseId())
                            .orElseThrow(() -> new ResourceNotFoundException("Exercise not found for id: " + entryDto.exerciseId()));
                    var entry = new WorkoutEntry();
                    entry.setWorkoutSession(session);
                    entry.setExercise(exercise);
                    entry.setSets(entryDto.sets());
                    entry.setReps(entryDto.reps());
                    entry.setWeight(entryDto.weight());
                    entry.setDurationMinutes(entryDto.durationMinutes());
                    entry.setDistanceKm(entryDto.distanceKm());
                    entry.setIntensity(entryDto.intensity());
                    return entry;
                })
                .toList());

        if (session.getEntries() != null) {
            session.getEntries().forEach(entry -> entry.setWorkoutSession(session));
        }
        return mapToResponseDto(sessionRepository.save(session));
    }

    @Override
    public void deleteSessionById(Long id) {
        sessionRepository.deleteById(id);
    }

    @Override
    public WorkoutSessionResponseDto updateSession(Long id, WorkoutSessionRequestDto updatedSession) {
        WorkoutSession existing = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workout session not found for id: " + id));

        existing.setTitle(updatedSession.title());
        existing.setDate(updatedSession.date());
        existing.setTotalDurationMinutes(updatedSession.totalDurationMinutes());
        existing.setTotalCaloriesBurned(updatedSession.totalCaloriesBurned());

        existing.getEntries().clear();
        if (updatedSession.entries() != null) {
            updatedSession.entries().forEach(entryDto -> {
                var exercise = exerciseRepository.findById(entryDto.exerciseId())
                        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found for id: " + entryDto.exerciseId()));
                var entry = new WorkoutEntry();
                entry.setWorkoutSession(existing);
                entry.setExercise(exercise);
                entry.setSets(entryDto.sets());
                entry.setReps(entryDto.reps());
                entry.setWeight(entryDto.weight());
                entry.setDurationMinutes(entryDto.durationMinutes());
                entry.setDistanceKm(entryDto.distanceKm());
                entry.setIntensity(entryDto.intensity());
                existing.addEntry(entry);
            });
        }

        WorkoutSession updated = sessionRepository.save(existing);
        return mapToResponseDto(updated);
    }

    @Override
    public Double getCaloriesToday(Long userId, LocalDate date) {
        Double totalCalories = sessionRepository.sumByCaloriesByUserIdAndDate(userId, date);
        if (totalCalories == null) {
            throw new ResourceNotFoundException("No workout sessions found for userId: " + userId + " on date: " + date);
        } 
        return totalCalories;
    }

    // Helper mapper: Converts JPA Entity -> Safe Response DTO
    private WorkoutSessionResponseDto mapToResponseDto(WorkoutSession session) {
        // return new WorkoutSessionResponseDto(
        //         session.getId(),
        //         session.getUser().getId(),
        //         session.getTitle(),
        //         session.getDate(),
        //         session.getTotalDurationMinutes(),
        //         session.getTotalCaloriesBurned(),
        //         session.getEntries().stream()
        //                 .map(entry -> new WorkoutEntryResponseDto(
        //                         entry.getId(),
        //                         session.getId(),
        //                         entry.getExercise().getId(),
        //                         entry.getSets(),
        //                         entry.getReps(),
        //                         entry.getWeight(),
        //                         entry.getDurationMinutes(),
        //                         entry.getDistanceKm(),
        //                         entry.getIntensity()
        //                 ))
        //                 .toList()
        // );

        List<WorkoutEntryResponseDto> entryDtos = session.getEntries() != null 
        ? session.getEntries().stream().map(entry -> new WorkoutEntryResponseDto(
            entry.getId(),
            session.getId(),
            entry.getExercise() != null ? entry.getExercise().getId() : null,
            entry.getExercise() != null && entry.getExercise().getExerciseType() != null ? entry.getExercise().getExerciseType().name() : "OTHER",
            entry.getExercise() != null && entry.getExercise().getName() != null ? entry.getExercise().getName() : entry.getExercise().getExerciseType() != null ? entry.getExercise().getExerciseType().name() : "Unknown Exercise",
            entry.getSets(),
            entry.getReps(),
            entry.getWeight(),
            entry.getDurationMinutes(),
            entry.getDistanceKm(),
            entry.getIntensity()
        )).toList()
        : List.of();

        return new WorkoutSessionResponseDto(
            session.getId(),
            session.getUser() != null ? session.getUser().getId() : null,
            session.getTitle(),
            session.getDate(),
            session.getTotalDurationMinutes(),
            session.getTotalCaloriesBurned(),
            entryDtos
        );

    }
}
