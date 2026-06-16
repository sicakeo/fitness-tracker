package com.chien.fitnesstracker.repository;

import com.chien.fitnesstracker.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;


public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    @Query("SELECT COALESCE(SUM(w.calories), 0) FROM Workout w WHERE w.user.id = :userId AND w.date = :date")
    Double sumByCaloriesByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<Workout> findByUserIdOrderByDateDesc(Long userId);
}
