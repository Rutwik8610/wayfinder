package com.tourism.backend.service;

import java.math.BigDecimal;

import com.tourism.backend.dto.BudgetResponse;
import com.tourism.backend.dto.ItineraryDayResponse;
import com.tourism.backend.dto.SpotInfoResponse;
import com.tourism.backend.dto.TripPlanRequest;
import com.tourism.backend.dto.TripPlanResponse;

import com.tourism.backend.entity.TouristSpot;
import com.tourism.backend.repository.TouristSpotRepository;

import com.tourism.backend.entity.Trip;
import com.tourism.backend.repository.TripRepository;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.tourism.backend.dto.RouteInfoResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final TouristSpotRepository touristSpotRepository;
    private final BudgetService budgetService;
    private final GeminiBudgetService geminiBudgetService;
    private final MapGeocodingService mapGeocodingService;

    public TripService(
            TripRepository tripRepository,
            TouristSpotRepository touristSpotRepository,
            BudgetService budgetService,
            GeminiBudgetService geminiBudgetService,
            MapGeocodingService mapGeocodingService) {

        this.tripRepository = tripRepository;
        this.touristSpotRepository = touristSpotRepository;
        this.budgetService = budgetService;
        this.geminiBudgetService = geminiBudgetService;
        this.mapGeocodingService = mapGeocodingService;
    }

    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public TripPlanResponse createPlan(TripPlanRequest request, Long userId) {
        if (request.getStartDate() == null
                || request.getEndDate() == null
                || request.getEndDate().isBefore(request.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid trip date range.");
        }
        int travelerCount = request.getTravelerCount() == null ? 1 : request.getTravelerCount();
        if (travelerCount < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one traveler is required.");
        }

        TouristSpot spot = resolveSpot(request);

        Trip trip = new Trip();
        if (userId != null) {
            trip.setUserId(userId);
        }
        trip.setStartLocation(request.getStartLocation());
        trip.setDestination(spot.getName());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setInterests(request.getInterests());
        if (userId != null) {
            tripRepository.save(trip);
        }

        long numberOfDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;

        RouteInfoResponse routeInfo = computeRouteInfo(trip.getStartLocation(), spot);

        BudgetResponse budgetPlan = null;
        try {
            boolean forceRefresh = Boolean.TRUE.equals(request.getForceRefresh());
            budgetPlan = geminiBudgetService.fetchGroundedBudget(
                    spot,
                    trip.getStartLocation(),
                    routeInfo.getDistanceKm(),
                    routeInfo.getDurationText(),
                    trip.getStartDate(),
                    trip.getEndDate(),
                    numberOfDays,
                    travelerCount,
                    forceRefresh
            );
        } catch (Exception e) {
            budgetPlan = geminiBudgetService.buildDistanceAwareFallback(
                    spot,
                    trip.getStartLocation(),
                    routeInfo.getDistanceKm(),
                    routeInfo.getDurationText(),
                    numberOfDays,
                    travelerCount
            );
        }

        return new TripPlanResponse(
                new SpotInfoResponse(spot),
                routeInfo,
                generateItinerary(trip, spot, numberOfDays),
                budgetPlan
        );
    }

    private RouteInfoResponse computeRouteInfo(String startLocation, TouristSpot spot) {
        String origin = startLocation == null || startLocation.isBlank() ? "Current Location" : startLocation.trim();
        String dest = spot.getName() + ", " + spot.getCity() + ", " + spot.getState();
        Double destLat = spot.getLatitude();
        Double destLng = spot.getLongitude();
        Double originLat = null;
        Double originLng = null;

        try {
            if (!origin.equalsIgnoreCase("Current Location") && !origin.matches("^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$")) {
                MapGeocodingService.GeocodedPlace place = mapGeocodingService.geocode(origin);
                if (place != null) {
                    originLat = place.latitude();
                    originLng = place.longitude();
                }
            } else if (origin.matches("^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$")) {
                String[] coords = origin.split(",");
                originLat = Double.parseDouble(coords[0].trim());
                originLng = Double.parseDouble(coords[1].trim());
            }
        } catch (Exception ignored) {
        }

        Double distanceKm = null;
        String durationText = "Estimated driving route";
        if (originLat != null && originLng != null && destLat != null && destLng != null) {
            double dLat = Math.toRadians(destLat - originLat);
            double dLng = Math.toRadians(destLng - originLng);
            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(Math.toRadians(originLat)) * Math.cos(Math.toRadians(destLat)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            double straightKm = 6371.0 * c;
            distanceKm = Math.round(straightKm * 1.25 * 10.0) / 10.0;

            double hours = distanceKm / 55.0;
            int h = (int) hours;
            int m = (int) Math.round((hours - h) * 60);
            if (h > 0) {
                durationText = h + " hr " + (m > 0 ? m + " min" : "") + " driving (" + distanceKm + " km)";
            } else {
                durationText = Math.max(15, m) + " min driving (" + distanceKm + " km)";
            }
        }

        String encodedOrigin = URLEncoder.encode(origin, StandardCharsets.UTF_8);
        String encodedDest = URLEncoder.encode(dest, StandardCharsets.UTF_8);
        String directionsUrl = "https://www.google.com/maps/dir/?api=1&origin=" + encodedOrigin + "&destination=" + encodedDest;
        String embedMapUrl = "https://maps.google.com/maps?saddr=" + encodedOrigin + "&daddr=" + encodedDest + "&output=embed";

        return new RouteInfoResponse(
                origin,
                dest,
                originLat,
                originLng,
                destLat,
                destLng,
                distanceKm,
                durationText,
                directionsUrl,
                embedMapUrl
        );
    }

        private TouristSpot resolveSpot(TripPlanRequest request) {
                if (request.getSpotId() != null) {
                        return touristSpotRepository.findById(request.getSpotId())
                                        .orElseThrow(() -> new ResponseStatusException(
                                                        HttpStatus.NOT_FOUND, "That tourist spot could not be found. Choose another spot."));
                }

                String destination = request.getDestination() == null ? "" : request.getDestination().trim();
                Optional<TouristSpot> namedSpot = touristSpotRepository.findFirstByNameIgnoreCase(destination);
                if (namedSpot.isPresent()) {
                        return namedSpot.get();
                }

                List<TouristSpot> citySpots = touristSpotRepository.findByCityIgnoreCase(destination);
                if (citySpots.size() == 1) {
                        return citySpots.get(0);
                }
                if (citySpots.size() > 1) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST, "Choose a specific tourist spot from Explore for this city.");
                }

                throw new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "No matching tourist spot was found. Choose a spot from Explore first.");
        }

        private List<ItineraryDayResponse> generateItinerary(Trip trip, TouristSpot spot, long numberOfDays) {
                List<String> activities = new ArrayList<>();
                if (spot.getAttractions() != null && !spot.getAttractions().isBlank()) {
                        for (String attraction : spot.getAttractions().split("[,;|\\r\\n]+")) {
                                if (!attraction.isBlank()) {
                                        activities.add(attraction.trim());
                                }
                        }
                }

                List<ItineraryDayResponse> itinerary = new ArrayList<>();
                for (int day = 0; day < numberOfDays; day++) {
                        List<String> dayActivities = activities.isEmpty()
                                        ? List.of()
                                        : List.of(activities.get(day % activities.size()));
                        itinerary.add(new ItineraryDayResponse(
                                        day + 1,
                                        trip.getStartDate().plusDays(day).toString(),
                                        dayActivities));
                }
                return itinerary;
        }

    public List<Trip> getAllTrips(Long userId) {
        return tripRepository.findByUserId(userId);
    }

    public List<Trip> getTripsByUser(Long userId) {
        return tripRepository.findByUserId(userId);
    }

    public Trip getTripById(Long id, Long userId) {
        return tripRepository.findById(id)
                .filter(trip -> userId.equals(trip.getUserId()))
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    public Trip updateTrip(Long id, Long userId, Trip updatedTrip) {

    Trip existingTrip = getTripById(id, userId);

    existingTrip.setStartLocation(updatedTrip.getStartLocation());
    existingTrip.setDestination(updatedTrip.getDestination());
    existingTrip.setStartDate(updatedTrip.getStartDate());
    existingTrip.setEndDate(updatedTrip.getEndDate());
    existingTrip.setBudget(updatedTrip.getBudget());
    existingTrip.setInterests(updatedTrip.getInterests());

    return tripRepository.save(existingTrip);
}

public void deleteTrip(Long id, Long userId) {

    Trip existingTrip = getTripById(id, userId);

    tripRepository.delete(existingTrip);
}

public List<TouristSpot> getTouristSpotsForTrip(Long tripId, Long userId) {

    Trip trip = getTripById(tripId, userId);

    return touristSpotRepository
            .findByCityContainingIgnoreCase(trip.getDestination());
}

public BigDecimal calculateTripEntryFees(Long tripId, Long userId) {

    List<TouristSpot> touristSpots =
            getTouristSpotsForTrip(tripId, userId);

    return budgetService.calculateEntryFees(touristSpots);
}

public BudgetResponse calculateFullBudget(Long tripId, Long userId) {

    Trip trip = getTripById(tripId, userId);

    // Calculate number of days
    long numberOfDays =
            java.time.temporal.ChronoUnit.DAYS.between(
                    trip.getStartDate(),
                    trip.getEndDate()
            ) + 1;

    // Number of nights
    long numberOfNights =
            java.time.temporal.ChronoUnit.DAYS.between(
                    trip.getStartDate(),
                    trip.getEndDate()
            );

    // Temporary estimates — we will replace these with real data later
    BigDecimal transportationFare =
        budgetService.getTransportationFare(
                trip.getStartLocation(),
                trip.getDestination()
        );

BigDecimal transportation =
        budgetService.calculateTransportationCost(
                transportationFare
        );

    BigDecimal accommodation =
            budgetService.calculateAccommodationCost(
                    BigDecimal.valueOf(2000),
                    numberOfNights
            );

    BigDecimal food =
            budgetService.calculateFoodCost(
                    BigDecimal.valueOf(700),
                    numberOfDays
            );

    BigDecimal entryFees =
            calculateTripEntryFees(tripId, userId);

    BigDecimal localTransport =
            budgetService.calculateLocalTransportCost(
                    BigDecimal.valueOf(200),
                    numberOfDays
            );

    // Calculate miscellaneous as 5% of the main expenses
    BigDecimal baseAmount =
            transportation
                    .add(accommodation)
                    .add(food)
                    .add(entryFees)
                    .add(localTransport);

    BigDecimal miscellaneous =
            budgetService.calculateMiscellaneousCost(
                    baseAmount,
                    BigDecimal.valueOf(5)
            );

    return new BudgetResponse(
            transportation,
            accommodation,
            food,
            entryFees,
            localTransport,
            miscellaneous
    );
}

}