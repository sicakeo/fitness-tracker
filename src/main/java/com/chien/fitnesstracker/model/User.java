package com.chien.fitnesstracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    private String username;

    @Size(min = 8, message = "Password has at least 8 characters.")
    private String password;

    @Column(name = "height")
    private Double height;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "name")
    private String name;

    @Column(name = "gender")
    private String gender;

    @Column(name = "fitness_goal")
    private String fitnessGoal; 

    @Column(name = "tdee")
    private Double tdee;

    @Column(name = "age")
    private Integer age;

    @NotNull(message = "Email is required")
    @Column(name = "email")
    private String email;

    @Column(name = "activity_level")
    private Double activityLevel;
}
