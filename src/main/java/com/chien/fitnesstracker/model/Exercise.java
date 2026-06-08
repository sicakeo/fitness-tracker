package com.chien.fitnesstracker.model;

import jakarta.persistence.*;
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Min(value = 0, message = "Weight can not be negative")
    private Double weight;


    @Column(name = "workout_type")
    @NotNull(message = "Workout type is required")
    private String workoutType;

    @Column(name = "met_value")
    private Double met;
}
