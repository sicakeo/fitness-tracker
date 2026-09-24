package com.chien.fitnesstracker.controller;

import com.chien.fitnesstracker.dto.Analytics.DailyCalorieSummaryDto;
import com.chien.fitnesstracker.repository.FoodEntryRepository;
import com.chien.fitnesstracker.repository.WorkoutSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final FoodEntryRepository foodRepo;
    private final WorkoutSessionRepository workoutRepo;

    public AnalyticsController(FoodEntryRepository foodRepo, WorkoutSessionRepository workoutRepo) {
        this.foodRepo = foodRepo;
        this.workoutRepo = workoutRepo;
    }

    @GetMapping("/7-day-trend")
    public ResponseEntity<List<DailyCalorieSummaryDto>> getSevenDayTrend(@RequestParam Long userId) {
        List<DailyCalorieSummaryDto> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Loop backwards to fetch the last 7 days chronologically
        for (int i = 6; i >= 0; i--) {
            LocalDate targetDate = today.minusDays(i);
            
            Double eaten = foodRepo.sumByCaloriesByUserIdAndDate(userId, targetDate);
            Double burned = workoutRepo.sumByCaloriesByUserIdAndDate(userId, targetDate);
            
            trend.add(new DailyCalorieSummaryDto(
                    targetDate.toString(),
                    eaten != null ? eaten : 0.0,
                    burned != null ? burned : 0.0
            ));
        }
        return ResponseEntity.ok(trend);
    }
}