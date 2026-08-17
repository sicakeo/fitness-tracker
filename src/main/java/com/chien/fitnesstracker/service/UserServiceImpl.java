package com.chien.fitnesstracker.service;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.repository.UserRepository;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        Optional<User> optional = userRepository.findById(id);
        User user;
        if (optional.isPresent()) user = optional.get();
        else throw new RuntimeException("User not found for id: " + id);
        return user;
    }
    @Override
    public User findByUsername(String username) {
        return this.userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public void deleteUserById(Long id) {
        this.userRepository.deleteById(id);
    }

    @Override
    public User saveUser(User user) {
        return this.userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User userToUpdate = this.getUserById(id);
        userToUpdate.setUsername(userDetails.getUsername());
        userToUpdate.setPassword(userDetails.getPassword());
        userToUpdate.setEmail(userDetails.getEmail());
        userToUpdate.setName(userDetails.getName());
        userToUpdate.setActivityLevel(userDetails.getActivityLevel());
        userToUpdate.setHeight(userDetails.getHeight());
        userToUpdate.setWeight(userDetails.getWeight());
        userToUpdate.setAge(userDetails.getAge());
        userToUpdate.setGender(userDetails.getGender());
        userToUpdate.setFitnessGoal(userDetails.getFitnessGoal());
        userToUpdate.setTdee(userDetails.getTdee());

        return this.userRepository.save(userToUpdate);
    }

    public User registerNewUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username is already taken.");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User authenticateUser(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        return user;
    }
}

