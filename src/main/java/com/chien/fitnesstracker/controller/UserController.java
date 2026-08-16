package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController{
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id){
        return ResponseEntity.ok(userService.getUserById(id));
    }

   @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User incomingData) {
        User existingUser = userService.getUserById(id);

        if (incomingData.getHeight() != null) {
            existingUser.setHeight(incomingData.getHeight());
        }
        if (incomingData.getWeight() != null) {
            existingUser.setWeight(incomingData.getWeight());
        }
        if (incomingData.getTdee() != null) {
            existingUser.setTdee(incomingData.getTdee());
        }
        if (incomingData.getAge() != null) {
            existingUser.setAge(incomingData.getAge());
        }
        if (incomingData.getFitnessGoal() != null) {
            existingUser.setFitnessGoal(incomingData.getFitnessGoal());
        }
        if (incomingData.getActivityLevel() != null) {
            existingUser.setActivityLevel(incomingData.getActivityLevel());
        }

        if (incomingData.getName() != null) {
            existingUser.setName(incomingData.getName());
        }
        if (incomingData.getGender() != null) {
            existingUser.setGender(incomingData.getGender());
        }

        if (incomingData.getUsername() != null && !incomingData.getUsername().isBlank()) {
            existingUser.setUsername(incomingData.getUsername());
        }
        if (incomingData.getEmail() != null && !incomingData.getEmail().isBlank()) {
            existingUser.setEmail(incomingData.getEmail());
        }

        userService.saveUser(existingUser);
        return ResponseEntity.ok(existingUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
