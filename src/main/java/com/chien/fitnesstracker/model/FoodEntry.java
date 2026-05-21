package com.chien.fitnesstracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "food_entries")
public class FoodEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Added nullable=false to ensure every entry has an owner
    private User user;

    @NotBlank(message = "Food name cannot be empty")
    private String name;

    @Min(value = 0, message = "Calories cannot be negative")
    private Double calories;

    @Min(value = 0, message = "Protein cannot be negative")
    private Double protein;

    @Min(value = 0, message = "Fats cannot be negative")
    private Double fat;

    @Min(value = 0, message = "Carbs cannot be negative")
    private Double carb;

    @NotNull(message = "Timestamp is required")
    @PastOrPresent(message = "You cannot enter a timestamp for the future")
    private LocalDateTime timestamp;
}