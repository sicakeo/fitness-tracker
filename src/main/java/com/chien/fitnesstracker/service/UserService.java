package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.LoginRequestDto;
import com.chien.fitnesstracker.dto.UserRegisterRequestDto;
import com.chien.fitnesstracker.dto.UserResponseDto;
import java.util.List;

public interface UserService {
    List<UserResponseDto> getUsers();
    UserResponseDto getUserById(Long id);
    UserResponseDto updateUser(Long id, UserRegisterRequestDto user);
    UserResponseDto findByUsername(String username);
    UserResponseDto registerNewUser(UserRegisterRequestDto user);
    UserResponseDto authenticateUser(LoginRequestDto user);
    void deleteUserById(Long id);
}
