package com.chien.fitnesstracker.repository;

import com.chien.fitnesstracker.model.FoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodEntryRepository  extends JpaRepository<FoodEntry, Long> {
}
