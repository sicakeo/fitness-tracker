package com.chien.fitnesstracker.model;

import com.chien.fitnesstracker.model.enums.IntensityType;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(name = "workout_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WorkoutEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonBackReference
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "nums_sets")
    @Min(value = 0, message = "Sets cannot be negative")
    private Integer sets;

    @Column(name = "nums_reps")
    @Min(value = 0, message = "Reps cannot be negative")
    private Integer reps;

    @Min(value = 0, message = "Weight cannot be negative")
    private Double weight;

    @Column(name = "duration_minutes")
    @Min(value = 0, message = "Duration cannot be negative")
    private Integer durationMinutes;

    @Column(name = "distance_km")
    @Min(value = 0, message = "Distance cannot be negative")
    private Double distanceKm;

    @Column(name = "intensity")
    @Enumerated(EnumType.STRING)
    private IntensityType intensity;
}
