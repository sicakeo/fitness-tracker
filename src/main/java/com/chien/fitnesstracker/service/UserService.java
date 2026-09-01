package com.chien.fitnesstracker.service;

import java.util.List;

import com.chien.fitnesstracker.dto.User.LoginRequestDto;
import com.chien.fitnesstracker.dto.User.UserRegisterRequestDto;
import com.chien.fitnesstracker.dto.User.UserResponseDto;

public interface UserService {
    List<UserResponseDto> getUsers();
    UserResponseDto getUserById(Long id);
    UserResponseDto updateUser(Long id, UserRegisterRequestDto user);
    UserResponseDto findByUsername(String username);
    UserResponseDto registerNewUser(UserRegisterRequestDto user);
    UserResponseDto authenticateUser(LoginRequestDto user);
    void deleteUserById(Long id);
}
