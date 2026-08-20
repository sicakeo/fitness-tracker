package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User reqUser;

    @BeforeEach
    void setUp() {
        reqUser = new User();
        reqUser.setId(1L);
        reqUser.setUsername("testuser");
        reqUser.setEmail("test@example.com");
    }

    @Test
    @DisplayName("GET /api/users/{id} should return 200 when user exists")
    void getUserById_validRequest_return200OkAndUser() throws Exception{

        when(userService.getUserById(1L)).thenReturn(reqUser);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())   
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @DisplayName("GET /api/users/{id} should return 404 when user does not exist")
    void getUserById_nonExistingId_return404NotFound() throws Exception {
        // Guarantee the exception is thrown on any login attempt
        doThrow(new ResourceNotFoundException("User not found for id: 1"))
                .when(userService).getUserById(1L);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isNotFound())      
                .andExpect(jsonPath("$.message").value("User not found for id: 1"));
    }

    @Test
    @DisplayName("PUT /api/users/{id} should return 200 when user exists")
    void updateUser_validRequest_return200OkAndUser() throws Exception {

        // Stimulate the service return the user given id
        when(userService.getUserById(1L)).thenReturn(reqUser);

        // Tell mockito return any object passed into save()
        when(userService.saveUser(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updateUser = new User();
        updateUser.setUsername("updateuser");
        updateUser.setEmail("update@example.com");

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateUser))) 
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(updateUser.getUsername()))
                .andExpect(jsonPath("$.email").value(updateUser.getEmail()));
    }

    @Test
    @DisplayName("PUT /api/users/{id} should return 404 when user does not exist")
    void updateUser_nonExistingId_returns404NotFound() throws Exception {
        User updateUser = new User();
        updateUser.setUsername("updateuser");

        doThrow(new ResourceNotFoundException("User not found for id: 2"))
                .when(userService).getUserById(2L);

        mockMvc.perform(put("/api/users/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateUser)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found for id: 2"));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} should return 200 when user exists")
    void deleteUser_existingId_return204Nocontent() throws Exception {

        doNothing().when(userService).deleteUserById(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/users/{id} should return 404 when user does not exists")
    void deleteUserById_nonExistingId_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("User not found for id: 1"))
                .when(userService).deleteUserById(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found for id: 1"));
    }
}
