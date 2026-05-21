package com.chien.fitnesstracker.controller;


import com.chien.fitnesstracker.model.FoodEntry;
import com.chien.fitnesstracker.service.FoodEntryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-entries")
public class FoodEntryController {
    private final FoodEntryService foodEntryService;
    public FoodEntryController(FoodEntryService foodEntryService) {
        this.foodEntryService = foodEntryService;
    }

    @GetMapping
    public List<FoodEntry> getFoodEntries(){
        return foodEntryService.getFoodEntries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodEntry> getFoodEntryById(@PathVariable Long id){
        return  ResponseEntity.ok(foodEntryService.getFoodEntryById(id));
    }

    @PostMapping
    public ResponseEntity<FoodEntry> createFoodEntry(@Valid @RequestBody FoodEntry foodEntry){
        return ResponseEntity.ok(foodEntryService.saveFoodEntry(foodEntry));
    }

    @PutMapping("/id")
    public ResponseEntity<FoodEntry> updateFoodEntry(@Valid @RequestBody FoodEntry foodEntry,
                                                     @PathVariable Long id){
        return ResponseEntity.ok(foodEntryService.updateFoodEntry(id,foodEntry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodEntry(@PathVariable Long id){
        foodEntryService.deleteFoodEntryById(id);
        return ResponseEntity.noContent().build();
    }
}
