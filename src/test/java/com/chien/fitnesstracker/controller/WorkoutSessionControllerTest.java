package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.WorkoutSession.WorkoutSessionRequestDto;
import com.chien.fitnesstracker.dto.WorkoutSession.WorkoutSessionResponseDto;
import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.security.JwtService;
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

import java.time.LocalDate;
import java.util.List;

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

@WebMvcTest(WorkoutSessionController.class)
@AutoConfigureMockMvc(addFilters = false)
public class WorkoutSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WorkoutSessionService sessionService;

    @MockitoBean 
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;
    
    private WorkoutSession testSession;

   private WorkoutSession createSampleWorkoutSession() {
        WorkoutSession workoutSession = new WorkoutSession();
        workoutSession.setTotalDurationMinutes(60);
        workoutSession.setTotalCaloriesBurned(500.0);
        workoutSession.setTitle("Test workout session");
        workoutSession.setDate(java.time.LocalDate.now());
        workoutSession.setUser(new com.chien.fitnesstracker.model.User());
        workoutSession.getUser().setId(1L);
        workoutSession.setEntries(List.of()); // Assuming entries is a list of some type
        workoutSession.setId(1L); // Set an ID for testing purposes
        return workoutSession;
    }


    private WorkoutSessionRequestDto createSampleWorkoutSessionRequest() {
        return new WorkoutSessionRequestDto(
                1L, // userId
                "Test workout session",
                java.time.LocalDate.now(),
                60, // totalDurationMinutes
                500.0, // totalCaloriesBurned
                List.of() // entries
        );
    }

    private WorkoutSessionResponseDto createSampleWorkoutSessionResponse(WorkoutSession workoutSession) {
        return new WorkoutSessionResponseDto(
                workoutSession.getId(),
                workoutSession.getUser().getId(),
                workoutSession.getTitle(),
                workoutSession.getDate(),
                workoutSession.getTotalDurationMinutes(),
                workoutSession.getTotalCaloriesBurned(),
                List.of() // entries
        );
    }

    // --- CREATE (POST) ---

    @Test
    @DisplayName("POST /api/workout-sessions should return 201 when creation is successful")
    void createSession_validPayload_returns201CreatedAndSession() throws Exception {
        testSession = createSampleWorkoutSession();
        when(sessionService.saveSession(any(WorkoutSessionRequestDto.class))).thenReturn(createSampleWorkoutSessionResponse(testSession));

        mockMvc.perform(post("/api/workout-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSampleWorkoutSessionRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.title").value("Test workout session"))
                .andExpect(jsonPath("$.totalDurationMinutes").value(60))
                .andExpect(jsonPath("$.totalCaloriesBurned").value(500.0));
    }

    // --- READ (GET) ---

    @Test
    @DisplayName("GET /api/workout-sessions/{id} should return 200 when workout exists")
    void getSessionById_existingId_returns200OkAndSession() throws Exception {
        testSession = createSampleWorkoutSession();
        when(sessionService.getSessionById(1L)).thenReturn(createSampleWorkoutSessionResponse(testSession));

        mockMvc.perform(get("/api/workout-sessions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.totalDurationMinutes").value(60))
                .andExpect(jsonPath("$.totalCaloriesBurned").value(500.0))
                .andExpect(jsonPath("$.title").value("Test workout session"));
    }

    @Test
    @DisplayName("GET /api/workout-sessions/{id} should return 404 when workout does not exist")
    void getSessionById_nonExistingId_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Session not found for id: 1"))
                .when(sessionService).getSessionById(1L);

        mockMvc.perform(get("/api/workout-sessions/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Session not found for id: 1"));
    }


    // --- UPDATE (PUT) ---

    @Test
    @DisplayName("PUT /api/workout-sessions/{id} should return 200 when update is successful")
    void updateSession_existingId_returns200OkAndUpdatedSession() throws Exception {
        WorkoutSession updatedSession = createSampleWorkoutSession();
        updatedSession.setTitle("Updated session title");
        updatedSession.setTotalCaloriesBurned(600.0);
        updatedSession.setTotalDurationMinutes(75);

        when(sessionService.updateSession(eq(1L), any(WorkoutSessionRequestDto.class))).thenReturn(createSampleWorkoutSessionResponse(updatedSession));

        mockMvc.perform(put("/api/workout-sessions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createSampleWorkoutSessionRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.title").value("Updated session title"))
                .andExpect(jsonPath("$.totalCaloriesBurned").value(600.0))
                .andExpect(jsonPath("$.totalDurationMinutes").value(75));
    }

    @Test
    @DisplayName("PUT /api/workout-sessions/{id} should return 404 when workout does not exist")
    void updateSession_nonExistingId_returns404NotFound() throws Exception {
        WorkoutSessionRequestDto testSessionRequestDto = createSampleWorkoutSessionRequest();
        doThrow(new ResourceNotFoundException("Session not found for id: 1"))
                .when(sessionService).updateSession(eq(1L), any(WorkoutSessionRequestDto.class));

        mockMvc.perform(put("/api/workout-sessions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSessionRequestDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Session not found for id: 1"));
    }

    // --- DELETE (DELETE) ---

    @Test
    @DisplayName("DELETE /api/workout-sessions/{id} should return 204 when deletion is successful")
    void deleteSession_existingId_returns204NoContent() throws Exception {
        doNothing().when(sessionService).deleteSessionById(1L);

        mockMvc.perform(delete("/api/workout-sessions/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/workout-sessions/{id} should return 404 when workout does not exist")
    void deleteSession_nonExistingId_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Session not found for id: 1"))
                .when(sessionService).deleteSessionById(1L);

        mockMvc.perform(delete("/api/workout-sessions/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Session not found for id: 1"));
    }

    @Test
    @DisplayName("GET /api/workout-sessions/today-calories should return 200 with total calories burned")
    void getCaloriesToday_validRequest_returns200AndTotalCalories() throws Exception {
        when(sessionService.getCaloriesToday(1L, LocalDate.now())).thenReturn(450.0);

        mockMvc.perform(get("/api/workout-sessions/today-calories")
                .param("userId", "1")
                .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(450.0));

    }

    @Test
    @DisplayName("GET /api/workout-sessions/today-calories should return 404 when no sessions exist for the date")
    void getCaloriesToday_noSessions_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("No workout sessions found for userId: 1 on date: " + LocalDate.now()))
                .when(sessionService).getCaloriesToday(1L, LocalDate.now());
        mockMvc.perform(get("/api/workout-sessions/today-calories")
                .param("userId", "1")
                .param("date", LocalDate.now().toString()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No workout sessions found for userId: 1 on date: " + LocalDate.now()));
    }

    @Test
    @DisplayName("GET /api/workout-sessions/history should return 200 with workout history")
    void getSessionHistory_validRequest_returns200AndWorkoutHistory() throws Exception {
        testSession = createSampleWorkoutSession();
        WorkoutSessionResponseDto testSessionResponse = createSampleWorkoutSessionResponse(testSession);
        when(sessionService.getSessionsByUserId(1L)).thenReturn(java.util.List.of(testSessionResponse));        

        mockMvc.perform(get("/api/workout-sessions/history")
                .param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].userId").value(1L))
                .andExpect(jsonPath("$[0].date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$[0].title").value("Test workout session"))
                .andExpect(jsonPath("$[0].totalDurationMinutes").value(60))
                .andExpect(jsonPath("$[0].totalCaloriesBurned").value(500.0));
    }



    @Test
    @DisplayName("GET /api/workout-sessions/history should return 404 when no workout history exists")
    void getSessionHistory_noHistory_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("No workout sessions found for userId: 1"))
                .when(sessionService).getSessionsByUserId(1L);  

        mockMvc.perform(get("/api/workout-sessions/history")
                .param("userId", "1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No workout sessions found for userId: 1"));
    }   



}