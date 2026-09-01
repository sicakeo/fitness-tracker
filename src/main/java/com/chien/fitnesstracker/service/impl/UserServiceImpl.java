package com.chien.fitnesstracker.service.impl;

import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.exception.UserAlreadyExistsException;
import com.chien.fitnesstracker.dto.LoginRequestDto;
import com.chien.fitnesstracker.dto.UserResponseDto;
import com.chien.fitnesstracker.dto.UserRegisterRequestDto;
import com.chien.fitnesstracker.exception.EmailAlreadyExistsException;
import com.chien.fitnesstracker.repository.UserRepository;
import com.chien.fitnesstracker.service.UserService;

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
    public List<UserResponseDto> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        Optional<User> optional = userRepository.findById(id);
        User user;
        if (optional.isPresent()) user = optional.get();
        else throw new ResourceNotFoundException("User not found for id: " + id) ;
        return this.mapToResponseDto(user);
    }
  
    @Override
    public UserResponseDto findByUsername(String username) {
        return this.mapToResponseDto(
            userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username))
        );
    }

    @Override
    public UserResponseDto updateUser(Long id, UserRegisterRequestDto userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + id));

        existingUser.setUsername(userDetails.username());
        existingUser.setEmail(userDetails.email());
        if (userDetails.password() != null && !userDetails.password().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.password()));
        }
        existingUser.setHeight(userDetails.height());
        existingUser.setWeight(userDetails.weight());
        existingUser.setAge(userDetails.age());
        existingUser.setGender(userDetails.gender());
        existingUser.setActivityLevel(userDetails.activityLevel());
        existingUser.setFitnessGoal(userDetails.fitnessGoal());
        existingUser.setTdee(userDetails.tdee());

        User updatedUser = userRepository.save(existingUser);
        return this.mapToResponseDto(updatedUser);
    }

    @Override
    public UserResponseDto registerNewUser(UserRegisterRequestDto request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username is already taken.");
        }
        
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email is already registered.");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setHeight(request.height());
        user.setWeight(request.weight());
        user.setAge(request.age());
        user.setGender(request.gender());
        user.setActivityLevel(request.activityLevel());
        user.setFitnessGoal(request.fitnessGoal());
        user.setTdee(request.tdee());

        User savedUser = userRepository.save(user);
        return this.mapToResponseDto(savedUser);
    }

    @Override
    public UserResponseDto authenticateUser(LoginRequestDto loginRequestDto) {
        User user = userRepository.findByUsername(loginRequestDto.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username."));

        if (!passwordEncoder.matches(loginRequestDto.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password.");
        }

        return this.mapToResponseDto(user);
    }

    @Override
    public void deleteUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + id));
        userRepository.delete(user);
    }

  // Helper mapper: Converts JPA Entity -> Safe Response DTO
    private UserResponseDto mapToResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getWeight(),
                user.getHeight(),
                user.getAge(),
                user.getGender(),
                user.getActivityLevel(),
                user.getFitnessGoal(),
                user.getTdee()
        );
    }
}

  