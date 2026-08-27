package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.exception.ResourceNotFoundException;
import com.chien.fitnesstracker.model.WorkoutSession;
import com.chien.fitnesstracker.service.*;
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

import java.time.LocalDate;

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

    @Autowired
    private ObjectMapper objectMapper;
    
    private WorkoutSession testSession;

    @BeforeEach
    void setUp() {
        testSession = new WorkoutSession();
        testSession.setId(1L);
        testSession.setDate(LocalDate.now());
        testSession.setTitle("Push Day");
        testSession.setTotalDurationMinutes(60);
        testSession.setTotalCaloriesBurned(450.0);
    }

    // --- CREATE (POST) ---

    @Test
    @DisplayName("POST /api/workout-sessions should return 201 when creation is successful")
    void createSession_validPayload_returns201CreatedAndSession() throws Exception {
        when(sessionService.saveSession(any(WorkoutSession.class))).thenReturn(testSession);

        mockMvc.perform(post("/api/workout-sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSession)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.title").value("Push Day"))
                .andExpect(jsonPath("$.totalDurationMinutes").value(60))
                .andExpect(jsonPath("$.totalCaloriesBurned").value(450));
    }

    // --- READ (GET) ---

    @Test
    @DisplayName("GET /api/workout-sessions/{id} should return 200 when workout exists")
    void getSessionById_existingId_returns200OkAndSession() throws Exception {
        when(sessionService.getSessionById(1L)).thenReturn(testSession);

        mockMvc.perform(get("/api/workout-sessions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.totalDurationMinutes").value(60))
                .andExpect(jsonPath("$.totalCaloriesBurned").value(450))
                .andExpect(jsonPath("$.title").value("Push Day"));
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
        WorkoutSession updatedSession = new WorkoutSession();
        updatedSession.setId(1L);
        updatedSession.setDate(LocalDate.now());
        updatedSession.setTitle("Leg Day");
        updatedSession.setTotalDurationMinutes(75);
        updatedSession.setTotalCaloriesBurned(500.0);

        when(sessionService.updateSession(eq(1L), any(WorkoutSession.class))).thenReturn(updatedSession);

        mockMvc.perform(put("/api/workout-sessions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.title").value("Leg Day"))
                .andExpect(jsonPath("$.totalCaloriesBurned").value(500.0))
                .andExpect(jsonPath("$.totalDurationMinutes").value(75));
    }

    @Test
    @DisplayName("PUT /api/workout-sessions/{id} should return 404 when workout does not exist")
    void updateSession_nonExistingId_returns404NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Session not found for id: 1"))
                .when(sessionService).updateSession(eq(1L), any(WorkoutSession.class));

        mockMvc.perform(put("/api/workout-sessions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSession)))
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
        when(sessionService.getSessionsByUserId(1L)).thenReturn(java.util.List.of(testSession));        

        mockMvc.perform(get("/api/workout-sessions/history")
                .param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$[0].title").value("Push Day"))
                .andExpect(jsonPath("$[0].totalDurationMinutes").value(60))
                .andExpect(jsonPath("$[0].totalCaloriesBurned").value(450.0));
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