package com.chien.fitnesstracker.model;

import com.chien.fitnesstracker.model.enums.exerciseType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
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
    @JsonIgnore(value = true) // Prevent serialization of the user field
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Column(name = "exercise_type")
    @NotNull(message = "Exercise type is required")
    @Enumerated(EnumType.STRING)
    private exerciseType exerciseType;

    @Column(name = "met_value")
    private Double met;
}
