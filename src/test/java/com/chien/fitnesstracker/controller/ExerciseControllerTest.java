package com.chien.fitnesstracker.controller;



import com.chien.fitnesstracker.dto.Exercise.ExerciseRequestDto;
import com.chien.fitnesstracker.dto.Exercise.ExerciseResponseDto;
import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import com.chien.fitnesstracker.model.Exercise;
import com.chien.fitnesstracker.model.User;
import com.chien.fitnesstracker.model.enums.ExerciseType;
import com.chien.fitnesstracker.service.*;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExerciseController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ExerciseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExerciseService exerciseService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean 
    private UserService userService;

    private Exercise testExercise;



    private Exercise createSampleExercise() {
        Exercise exercise = new Exercise();
        exercise.setName("Test Exercise");
        exercise.setExerciseType(ExerciseType.CARDIO);
        exercise.setMet(8.0);
        User user = new User();
        user.setId(1L);
        exercise.setUser(user);   
        exercise.setId(1L); // Set an ID for the exercise
        return exercise;
    }

    private ExerciseRequestDto createSampleExerciseRequest() {
        return new ExerciseRequestDto(
                1L, // userId
                "Test Exercise",
                ExerciseType.CARDIO,
                8.0
        );
    }

    private ExerciseResponseDto createSampleExerciseResponse(Exercise exercise) {
        return new ExerciseResponseDto(
                exercise.getId(),
                exercise.getUser().getId(),
                exercise.getName(),
                exercise.getExerciseType(),
                exercise.getMet()
        );
    }


    @Test
    @DisplayName("GET /api/exercises/{id} should return 200 when exercise exists") 
    void getExercise_existingId_returns200OkAndExercise() throws Exception {
        testExercise = createSampleExercise();
        ExerciseResponseDto testExerciseResponse = createSampleExerciseResponse(testExercise);
        when(exerciseService.getExercise(1L)).thenReturn(testExerciseResponse);

        mockMvc.perform(get("/api/exercises/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Test Exercise"))
                .andExpect(jsonPath("$.met").value(8.0))
                .andExpect(jsonPath("$.exerciseType").value("CARDIO"));
    }   

    @Test
    @DisplayName("GET /api/exercises/{id} should return 404 when exercise does not exist") 
    void getExercise_existingId_returns404NotFound() throws Exception {
        when(exerciseService.getExercise(1L)).thenThrow(new ResourceNotFoundException("Exercise not found for id: 1"));

        mockMvc.perform(get("/api/exercises/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Exercise not found for id: 1"));
    }   

    @Test
    @DisplayName("POST /api/exercises should return 201 when creation is successful") 
    void createExercise_validPayload_returns201CreatedAndExercise() throws Exception {
        testExercise = createSampleExercise();
        ExerciseResponseDto testExerciseResponse = createSampleExerciseResponse(testExercise);
        ExerciseRequestDto testExerciseRequest = createSampleExerciseRequest();
        when(exerciseService.addExercise(any(ExerciseRequestDto.class))).thenReturn(testExerciseResponse);

        mockMvc.perform(post("/api/exercises")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testExerciseRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Test Exercise"))
                .andExpect(jsonPath("$.exerciseType").value("CARDIO"));
    }

    @Test
    @DisplayName("POST /api/exercises should return 400 when creation fails due to validation errors")
    void createExercise_invalidPayload_returns400BadRequest() throws Exception {
        Exercise invalidExercise = new Exercise();
        invalidExercise.setName(""); // Invalid name
        invalidExercise.setExerciseType(null); // Invalid exercise type

        mockMvc.perform(post("/api/exercises")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidExercise)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/exercises/{id} should return 200 when update is successful")
    void updateExercise_validPayload_returns200OkAndUpdatedExercise() throws Exception {
        Exercise updatedExercise = new Exercise();
        updatedExercise.setId(1L);
        updatedExercise.setName("Updated Push Up");
        updatedExercise.setUser(new User());
        updatedExercise.getUser().setId(1L);
        updatedExercise.setExerciseType(ExerciseType.WEIGHTLIFTING);
        ExerciseResponseDto updatedExerciseResponse = createSampleExerciseResponse(updatedExercise);
        when(exerciseService.updateExercise(eq(1L), any(ExerciseRequestDto.class))).thenReturn(updatedExerciseResponse);
    
        
        mockMvc.perform(put("/api/exercises/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSampleExerciseRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Updated Push Up"))
                .andExpect(jsonPath("$.exerciseType").value("WEIGHTLIFTING"));
    }

    @Test
    @DisplayName("PUT /api/exercises/{id} should return 404 when exercise does not exist")
    void updateExercise_nonExistingId_returns404NotFound() throws Exception {
        when(exerciseService.updateExercise(eq(1L), any(ExerciseRequestDto.class))).thenThrow(new ResourceNotFoundException("Exercise not found for id: 1"));

        Exercise updatedExercise = new Exercise();
        updatedExercise.setId(1L);
        updatedExercise.setName("Updated Push Up");
        updatedExercise.setExerciseType(ExerciseType.WEIGHTLIFTING);

        mockMvc.perform(put("/api/exercises/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSampleExerciseRequest())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Exercise not found for id: 1"));
    }

    @Test
    @DisplayName("DELETE /api/exercises/{id} should return 204 when deletion is successful")
    void deleteExercise_existingId_returns204NoContent() throws Exception {
        doNothing().when(exerciseService).deleteExercise(1L);

        mockMvc.perform(delete("/api/exercises/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/exercises/{id} should return 404 when exercise does not exist")
    void deleteExercise_nonExistingId_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Exercise not found for id: 1"))
                .when(exerciseService).deleteExercise(1L);

        mockMvc.perform(delete("/api/exercises/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Exercise not found for id: 1"));
    } 
}