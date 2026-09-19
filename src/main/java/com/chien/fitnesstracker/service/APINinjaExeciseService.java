package com.chien.fitnesstracker.service;

import com.chien.fitnesstracker.dto.Exercise.ExerciseSearchResultDto;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

@Service 
public class APINinjaExeciseService {
    
    private final RestClient restClient;
    private static final Logger log = LoggerFactory.getLogger(APINinjaExeciseService.class);

    public APINinjaExeciseService(
            @Value("${api.ninja.base-url}") String baseUrl,
            @Value("${api.ninja.key}") String apiKey
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Api-Key", apiKey)
                .build();
    }

    public List<ExerciseSearchResultDto> searchExercises(String query, String category) {
        List<ExerciseSearchResultDto> results = new ArrayList<>();
        
        // Map enums to the official API Ninjas types
        String apiNinjaType = switch (category) {
            case "CORE_STRENGTH" -> "strength";
            case "HIIT_CARDIO" -> "cardio";
            case "MIND_BODY" -> "stretching";
            default -> null;
        };

        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/v1/exercises").queryParam("name", query);
                        if (apiNinjaType != null) {
                            uriBuilder.queryParam("type", apiNinjaType);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.isArray()) {
                for (JsonNode exerciseNode : response) {
                    String name = exerciseNode.has("name") ? exerciseNode.get("name").asText() : "Unknown";
                    String type = exerciseNode.has("type") ? exerciseNode.get("type").asText() : "OTHER";
                    results.add(new ExerciseSearchResultDto(name, type));
                    if (results.size() >= 5) break; 
                }
            }
        } catch (RestClientResponseException e) {
            log.error("API Ninjas request failed: " + e.getRawStatusCode() + " - " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Failed to fetch exercises: ", e);
        }
        return results;
    }
}