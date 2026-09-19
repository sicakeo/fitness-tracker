package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.Exercise.ExerciseSearchResultDto;
import com.chien.fitnesstracker.service.APINinjaExeciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercise-search")
public class ExerciseSearchController {

    private final APINinjaExeciseService apiNinjaExeciseService;

    public ExerciseSearchController(APINinjaExeciseService apiNinjaExeciseService) {
        this.apiNinjaExeciseService = apiNinjaExeciseService;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseSearchResultDto>> searchExercises(
            @RequestParam String query, 
            @RequestParam(required = false, defaultValue = "OTHER") String category) {
        
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(apiNinjaExeciseService.searchExercises(query, category));
    }
}