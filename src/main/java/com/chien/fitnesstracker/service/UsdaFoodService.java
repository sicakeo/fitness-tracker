package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.FoodEntry.FoodSearchResultDto;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class UsdaFoodService {

    private final RestClient restClient;
    private final String apiKey;

    public UsdaFoodService(
            @Value("${usda.api.base-url}") String baseUrl,
            @Value("${usda.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public List<FoodSearchResultDto> searchFoods(String query) {
        // Call the USDA Search Endpoint
        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/foods/search")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("pageSize", "5") // Limit to top 5 results for snappy autocomplete
                        .build())
                .retrieve()
                .body(JsonNode.class);

        List<FoodSearchResultDto> results = new ArrayList<>();
        if (response != null && response.has("foods")) {
            for (JsonNode foodNode : response.get("foods")) {
                String description = foodNode.get("description").asText();
                double calories = 0.0, protein = 0.0, carbs = 0.0, fat = 0.0;

                // Extract specific macros from the nutrients array
                if (foodNode.has("foodNutrients")) {
                    for (JsonNode nutrient : foodNode.get("foodNutrients")) {
                        int nutrientId = nutrient.get("nutrientId").asInt();
                        double amount = nutrient.has("value") ? nutrient.get("value").asDouble() : 0.0;

                        switch (nutrientId) {
                            case 1008 -> calories = amount; // Energy
                            case 1003 -> protein = amount;  // Protein
                            case 1004 -> fat = amount;      // Total lipid (fat)
                            case 1005 -> carbs = amount;    // Carbohydrate
                        }
                    }
                }
                results.add(new FoodSearchResultDto(description, calories, protein, carbs, fat));
            }
        }
        return results;
    }
}