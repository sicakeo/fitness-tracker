package com.chien.fitnesstracker.repository;

import com.chien.fitnesstracker.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
}
