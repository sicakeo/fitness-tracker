package com.chien.fitnesstracker.dto.User;

public record AuthResponseDto(
    UserResponseDto user,
    String token
) {}
