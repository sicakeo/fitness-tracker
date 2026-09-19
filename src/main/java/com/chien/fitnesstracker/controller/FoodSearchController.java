package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.FoodEntry.FoodSearchResultDto;
import com.chien.fitnesstracker.service.UsdaFoodService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-search")
public class FoodSearchController {

    private final UsdaFoodService usdaFoodService;

    public FoodSearchController(UsdaFoodService usdaFoodService) {
        this.usdaFoodService = usdaFoodService;
    }

    @GetMapping
    public ResponseEntity<List<FoodSearchResultDto>> searchFood(@RequestParam String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(usdaFoodService.searchFoods(query));
    }
}