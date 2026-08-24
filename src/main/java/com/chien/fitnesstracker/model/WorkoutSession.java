package com.chien.fitnesstracker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "workout_sessions")
public class WorkoutSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Column(name = "title")
    private String title; // e.g., "Upper Body Strength"

    @NotNull(message = "Session date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate date;

    @Column(name = "duration_minutes")
    private Integer totalDurationMinutes;

    @Column(name = "calories_burned")
    private Double totalCaloriesBurned;

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<WorkoutEntry> entries = new ArrayList<>();

    public void addEntry(WorkoutEntry entry) {
        entries.add(entry);
        entry.setWorkoutSession(this);
    }
}
