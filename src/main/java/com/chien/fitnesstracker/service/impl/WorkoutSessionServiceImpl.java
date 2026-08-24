package com.chien.fitnesstracker.service.impl;

import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.repository.WorkoutSessionRepository;
import com.chien.fitnesstracker.service.WorkoutSessionService;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WorkoutSessionServiceImpl implements WorkoutSessionService {
    private final WorkoutSessionRepository sessionRepository;
    public WorkoutSessionServiceImpl(WorkoutSessionRepository workoutSessionRepository) {
        this.sessionRepository = workoutSessionRepository;
    }

    @Override
    public WorkoutSession getSessionById(Long id) {
        Optional<WorkoutSession> optional = sessionRepository.findById(id);
        WorkoutSession workoutSession;
        if (optional.isPresent()) workoutSession = optional.get();
        else throw new RuntimeException("WorkoutSession not found for id: " + id);
        return workoutSession;
    }

    @Override
    public List<WorkoutSession> getSessionsByUserId(Long userId) {
        return sessionRepository.findSessionsByUserIdOrderByDateDesc(userId);
    }

    @Override
    public WorkoutSession saveSession(WorkoutSession session) {
        if (session.getEntries() != null) {
            session.getEntries().forEach(entry -> entry.setWorkoutSession(session));
        }
        return sessionRepository.save(session);
    }

    @Override
    public void deleteSessionById(Long id) {
        sessionRepository.deleteById(id);
    }

    @Override
    public WorkoutSession updateSession(Long id, WorkoutSession updatedSession) {
        WorkoutSession existing = getSessionById(id);

        existing.setTitle(updatedSession.getTitle());
        existing.setDate(updatedSession.getDate());
        existing.setTotalDurationMinutes(updatedSession.getTotalDurationMinutes());
        existing.setTotalCaloriesBurned(updatedSession.getTotalCaloriesBurned());

        existing.getEntries().clear();
        if (updatedSession.getEntries() != null) {
            updatedSession.getEntries().forEach(existing::addEntry);
        }

        return sessionRepository.save(existing);
    }

    @Override
    public Double getCaloriesToday(Long userId, LocalDate date) {
        return sessionRepository.sumByCaloriesByUserIdAndDate(userId, date);
    }
}
