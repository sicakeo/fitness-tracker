package com.chien.fitnesstracker.repository;

import com.chien.fitnesstracker.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;


public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    @Query("SELECT COALESCE(SUM(w.totalCaloriesBurned), 0) FROM WorkoutSession w WHERE w.user.id = :userId AND w.date = :date")
    Double sumByCaloriesByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Query("SELECT w FROM WorkoutSession w WHERE w.user.id = :userId ORDER BY w.date DESC")
    List<WorkoutSession> findSessionsByUserIdOrderByDateDesc(@Param("userId") Long userId);
    WorkoutSession findByUserId(@Param("userId") Long userId);
}
