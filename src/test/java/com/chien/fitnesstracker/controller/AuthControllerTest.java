package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.service.UserService;
import com.chien.fitnesstracker.exception.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
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

	private User testUser;

	@BeforeEach
	void setUp(){
		testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("testpassword");
        testUser.setEmail("test@example.com");
	}

    @Test
    @DisplayName("POST /register should return 409 when username already exists")
    void register_existingUsername_return400BadRequest() throws Exception {
        // Simulate the service throwing the duplicate username exception
        doThrow(new UserAlreadyExistsException("Username is already taken."))
                .when(userService).registerNewUser(any(User.class));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Username is already taken."));
    }

    @Test
    @DisplayName("POST /register should return 409 when email already exists")
    void register_existingEmail_return400BadRequest() throws Exception {

        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setEmail("test@example.com");
        // Simulate the service throwing the duplicate email exception

        doThrow(new EmailAlreadyExistsException("Email is already taken."))
                .when(userService).registerNewUser(newUser);


        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email is already taken."));
    }

    @Test
    @DisplayName("POST /register should return 200 when user is successfully registered")
    void register_validRequest_return200OkWithUser() throws Exception {
        // Simulate the service returning the registered user
        when(userService.registerNewUser(any(User.class))).thenReturn(testUser);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 401 when username does not exist")
    void login_userNotFound_returns401BadCredentials() throws Exception {
        User loginRequest = new User();
        loginRequest.setUsername("wronguser");

        // Guarantee the exception is thrown on any login attempt
        doThrow(new BadCredentialsException("Invalid username."))
                .when(userService).authenticateUser(nullable(String.class), nullable(String.class));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath( "$.message").value("Invalid username."));       
    }


	@Test
	@DisplayName("POST /api/auth/login should return 401 when password is wrong")
	void login_wrongPassword_returns401BadCredentials() throws Exception {
		User loginRequest = new User();
		loginRequest.setUsername("testuser");
		loginRequest.setPassword("wrongpassword");

		// Guarantee the exception is thrown on any login attempt
		doThrow(new BadCredentialsException("Invalid password."))
				.when(userService).authenticateUser(nullable(String.class), nullable(String.class));

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath( "$.message").value("Invalid password."));       
	}

    @Test
    @DisplayName("POST /login should return 200 when credentials are correct")
    void logion_validRequest_return200OkWithUser() throws Exception {
        User loginRequest = new User();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("testpassword");

        // Simulate the service returning the user for correct credentials
        when(userService.authenticateUser(any(), any())).thenReturn(testUser);

        mockMvc.perform(post("/api/auth/login")
                .with(csrf())  // Add CSRF token to the request
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }
}