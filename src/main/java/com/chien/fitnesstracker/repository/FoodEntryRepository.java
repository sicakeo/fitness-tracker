package com.chien.fitnesstracker.repository;

import com.chien.fitnesstracker.model.FoodEntry;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FoodEntryRepository  extends JpaRepository<FoodEntry, Long> {
    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodEntry f WHERE f.user.id = :userId AND f.date = :date")
    Double sumByCaloriesByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    List<FoodEntry> findByUserIdOrderByDateDesc(@Param("userId") Long userId);
}
