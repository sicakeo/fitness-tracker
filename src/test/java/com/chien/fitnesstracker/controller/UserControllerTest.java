package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.User.UserRegisterRequestDto;
import com.chien.fitnesstracker.dto.User.UserResponseDto;
import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.model.enums.FitnessGoal;
import com.chien.fitnesstracker.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
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

    // --- Helper Fixtures ---

    private User createSampleUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setPassword("testpassword");
        user.setWeight(70.0);
        user.setHeight(175.0);
        user.setAge(25);
        user.setGender("M");
        user.setActivityLevel(1.2);
        user.setFitnessGoal(FitnessGoal.MAINTAIN);
        user.setTdee(2500.0);
        return user;
    }

    private UserResponseDto createSampleUserResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getWeight(),
                user.getHeight(),
                user.getAge(),
                user.getGender(),
                user.getActivityLevel(),
                user.getFitnessGoal(),
                user.getTdee()
        );
    }

    private UserRegisterRequestDto createSampleUserRegisterRequestDto() {
        return new UserRegisterRequestDto(
                "testuser",
                "test@example.com",
                "testpassword",
                "Test User",
                70.0,
                175.0,
                25,
                "M",
                1.2,
                FitnessGoal.MAINTAIN,
                2500.0
        );
    }

    // --- Unit Tests ---

    @Test
    @DisplayName("GET /api/users/{id} should return 200 and exclude email")
    void getUserById_validRequest_return200OkAndUser() throws Exception {
        User testUser = createSampleUser();
        UserResponseDto testUserResponse = createSampleUserResponseDto(testUser);
        when(userService.getUserById(1L)).thenReturn(testUserResponse);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").doesNotExist()); // Confirms email is omitted
    }

    @Test
    @DisplayName("GET /api/users/{id} should return 404 when user does not exist")
    void getUserById_nonExistingId_return404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("User not found for id: 1"))
                .when(userService).getUserById(1L);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found for id: 1"));
    }

    @Test
    @DisplayName("PUT /api/users/{id} should return 200 when user exists")
    void updateUser_validRequest_return200OkAndUser() throws Exception {
        User updateUser = createSampleUser();
        updateUser.setUsername("updateuser");
        updateUser.setName("Updated User");
        UserResponseDto testUserResponse = createSampleUserResponseDto(updateUser);

        // Adjust to match your UserController method signature (e.g. updateUser(id, dto) or saveUser(dto))
        when(userService.updateUserProfile(eq(1L), any(UserRegisterRequestDto.class))).thenReturn(testUserResponse);

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSampleUserRegisterRequestDto()))) // Fixed method name
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("updateuser"))
                .andExpect(jsonPath("$.name").value("Updated User"))
                .andExpect(jsonPath("$.email").doesNotExist());
    }

    @Test
    @DisplayName("PUT /api/users/{id} should return 404 when user does not exist")
    void updateUser_nonExistingId_returns404NotFound() throws Exception {
        // Aligned ID 2L between when() and mockMvc.perform()
        doThrow(new ResourceNotFoundException("User not found for id: 2"))
                .when(userService).updateUserProfile(eq(2L), any(UserRegisterRequestDto.class));

        mockMvc.perform(put("/api/users/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSampleUserRegisterRequestDto()))) // Fixed method name
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found for id: 2"));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} should return 204 when user exists")
    void deleteUser_existingId_return204Nocontent() throws Exception {
        doNothing().when(userService).deleteUserById(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/users/{id} should return 404 when user does not exist")
    void deleteUserById_nonExistingId_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("User not found for id: 1"))
                .when(userService).deleteUserById(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found for id: 1"));
    }
}