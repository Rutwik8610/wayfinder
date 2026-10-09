package com.tourism.backend.controller;

import com.tourism.backend.dto.BudgetResponse;
import com.tourism.backend.dto.TripPlanRequest;
import com.tourism.backend.dto.TripPlanResponse;
import com.tourism.backend.entity.TouristSpot;

import com.tourism.backend.entity.Trip;
import com.tourism.backend.service.TripService;
import com.tourism.backend.security.JwtPrincipal;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip, @AuthenticationPrincipal JwtPrincipal principal) {
        trip.setUserId(principal.userId());
        return tripService.createTrip(trip);
    }

    @PostMapping("/plan")
    public TripPlanResponse createTripPlan(
            @RequestBody TripPlanRequest request,
            @AuthenticationPrincipal JwtPrincipal principal) {
        return tripService.createPlan(request, principal == null ? null : principal.userId());
    }

    @GetMapping
    public List<Trip> getAllTrips(@AuthenticationPrincipal JwtPrincipal principal) {
        return tripService.getAllTrips(principal.userId());
    }

    @GetMapping("/user/{userId}")
    public List<Trip> getTripsByUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal JwtPrincipal principal) {

        if (!principal.userId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot view another user's trips.");
        }
        return tripService.getTripsByUser(principal.userId());
    }

    @GetMapping("/{id}")
    public Trip getTripById(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtPrincipal principal) {

        return tripService.getTripById(id, principal.userId());
    }

    @PutMapping("/{id}")
    public Trip updateTrip(
            @PathVariable Long id,
            @RequestBody Trip trip,
            @AuthenticationPrincipal JwtPrincipal principal) {

        return tripService.updateTrip(id, principal.userId(), trip);
    }

    @DeleteMapping("/{id}")
    public String deleteTrip(@PathVariable Long id, @AuthenticationPrincipal JwtPrincipal principal) {

        tripService.deleteTrip(id, principal.userId());

        return "Trip deleted successfully";
    }

    @GetMapping("/{id}/tourist-spots")
public List<TouristSpot> getTouristSpotsForTrip(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtPrincipal principal) {

    return tripService.getTouristSpotsForTrip(id, principal.userId());
}

@GetMapping("/{id}/entry-fees")
public BigDecimal getTripEntryFees(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtPrincipal principal) {

    return tripService.calculateTripEntryFees(id, principal.userId());
}

@GetMapping("/{id}/budget")
public BudgetResponse getTripBudget(
        @PathVariable Long id,
        @AuthenticationPrincipal JwtPrincipal principal) {

    return tripService.calculateFullBudget(id, principal.userId());
}

}