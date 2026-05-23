package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/register")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user){
        return  ResponseEntity.ok(userService.saveUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody User loginRequest){
    User user = userService.findByUsername(loginRequest.getUsername());

    // TEMPORARY DEBUG LOGS
    System.out.println("From Frontend DB Request -> User: '" + loginRequest.getUsername() + "' Pass: '" + loginRequest.getPassword() + "'");
    if (user != null) {
        System.out.println("From MySQL Database Row -> User: '" + user.getUsername() + "' Pass: '" + user.getPassword() + "'");
    } else {
        System.out.println("User was NOT found in the database at all!");
    }

    if (user != null && user.getPassword().equals(loginRequest.getPassword())) {
        return ResponseEntity.ok(user);
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Your username or password is incorrect");
    }
    

   public ResponseEntity<User> updateUser(Long id, User incomingData) {
    User existingUser = userService.getUserById(id);

    if (incomingData.getHeight() != null) {
        existingUser.setHeight(incomingData.getHeight());
    }
    if (incomingData.getWeight() != null) {
        existingUser.setWeight(incomingData.getWeight());
    }
    if (incomingData.getBmr() != null) {
        existingUser.setBmr(incomingData.getBmr());
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
