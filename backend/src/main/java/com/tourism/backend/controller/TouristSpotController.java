package com.tourism.backend.controller;

import com.tourism.backend.entity.TouristSpot;
import com.tourism.backend.repository.TouristSpotRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tourist-spots")
public class TouristSpotController {

    private final TouristSpotRepository repository;

    public TouristSpotController(TouristSpotRepository repository) {
        this.repository = repository;
    }

    // Get all tourist spots
    @GetMapping
    public List<TouristSpot> getAllTouristSpots() {
        return repository.findAll();
    }

    // Search by name
    @GetMapping("/search")
    public List<TouristSpot> searchTouristSpots(
            @RequestParam("name") String name) {

        return repository.findByNameContainingIgnoreCase(name);
    }

    // Get tourist spot by ID
    @GetMapping("/{id}")
    public TouristSpot getTouristSpotById(
            @PathVariable("id") Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tourist spot not found"));
    }

    @GetMapping("/city/{city}")
public List<TouristSpot> getTouristSpotsByCity(
        @PathVariable String city) {

    return repository.findByCityContainingIgnoreCase(city);
}

@GetMapping("/interest/{interest}")
public List<TouristSpot> getTouristSpotsByInterest(
        @PathVariable String interest) {
    return repository.findByInterestsContainingIgnoreCase(interest);
}

}