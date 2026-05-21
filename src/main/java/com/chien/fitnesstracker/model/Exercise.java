package com.chien.fitnesstracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "exercises") // Add this!
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Exercise name is required")
    private String name;

    @Column(name = "num_sets")
    @Min(value = 1, message = "Must have at least 1 set")
    @Max(value = 100, message = "Sets cannot exceed 100")
    private Integer sets;

    @Column(name = "num_reps")
    @Min(value = 1, message = "Must have at least 1 rep") // Fixed your message here too!
    private Integer reps;

    @Min(value = 0, message = "Weight can not be negative")
    private Double weight;

    @ManyToOne
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;
}
