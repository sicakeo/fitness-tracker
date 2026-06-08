package com.chien.fitnesstracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;

import java.time.LocalDate;



@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "workouts")
public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate date;

    @Column(name = "duration_minutes")
    @Min(value = 0, message = "Duration can not be negative")
    private Integer duration; // in minutes

    @Min(value = 0, message = "Distance can not be negative")
    private Double distance; // in kilometers

    @Column(name = "calories_burned")
    @Min(value = 0, message = "Calories can not be negative")
    private Double calories;

    @Column(name = "num_sets")
    @Min(value = 0, message = "Reps can not be negative")
    private Integer reps;

    @Column(name = "num_reps")
    @Min(value = 0, message = "Sets can not be negative")
    private Integer sets;

    @Min(value = 0, message = "Weight can not be negative")
    private Double weight;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "intensity")
    private String intensity;
}
