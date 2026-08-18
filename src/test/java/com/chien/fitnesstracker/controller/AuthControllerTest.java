package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for testing
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /register should return 400 when username already exists")
    void shouldReturn400WhenUsernameIsTaken() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        // Simulate the service throwing the duplicate username exception
        doThrow(new IllegalArgumentException("Username is already taken."))
                .when(userService).registerNewUser(user);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Username is already taken."));
    }

    @Test
    @DisplayName("POST /register should return 400 when email already exists")
    void shouldReturn400WhenEmailIsTaken() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        // Simulate the service throwing the duplicate email exception
        doThrow(new IllegalArgumentException("Email is already taken."))
                .when(userService).registerNewUser(user);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already taken."));
    }

    @Test
    @DisplayName("POST /register should return 200 when user is successfully registered")
    void shouldReturn200WhenUserIsRegistered() throws Exception {
        User user = new User();
        user.setUsername("newuser");
        user.setEmail("test@example.com");

        // Simulate the service returning the registered user
        when(userService.registerNewUser(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 401 when credentials are incorrect")
    void shouldReturn401WhenCredentialsAreIncorrect() throws Exception {
        User loginRequest = new User();
        loginRequest.setUsername("wronguser");
        loginRequest.setPassword("wrongpassword");

        // Guarantee the exception is thrown on any login attempt
        doThrow(new BadCredentialsException("Invalid username or password."))
                .when(userService).authenticateUser(nullable(String.class), nullable(String.class));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());       
    }

    @Test
    @DisplayName("POST /login should return 200 when credentials are correct")
    void shouldReturn200WhenCredentialsAreCorrect() throws Exception {
        User loginRequest = new User();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("correctpassword");

        User foundUser = new User();
        foundUser.setUsername("testuser");
        foundUser.setPassword("correctpassword");   

        // Simulate the service returning the user for correct credentials
        when(userService.authenticateUser(any(), any())).thenReturn(foundUser);

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())  // Add CSRF token to the request
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }
}