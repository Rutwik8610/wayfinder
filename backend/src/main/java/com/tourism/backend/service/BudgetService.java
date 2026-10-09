package com.tourism.backend.service;

import com.tourism.backend.entity.TouristSpot;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BudgetService {

    private final TransportFareService transportFareService;

    public BudgetService(TransportFareService transportFareService) {
        this.transportFareService = transportFareService;
    }

    // Calculate total entry fees of tourist spots
    public BigDecimal calculateEntryFees(List<TouristSpot> touristSpots) {

        BigDecimal total = BigDecimal.ZERO;

        for (TouristSpot spot : touristSpots) {

            if (spot.getEntryFee() != null) {
                total = total.add(spot.getEntryFee());
            }
        }

        return total;
    }

    // Public transportation cost
    public BigDecimal calculateTransportationCost(BigDecimal fare) {

        if (fare == null) {
            return BigDecimal.ZERO;
        }

        return fare;
    }

    // Get transportation fare from database
public BigDecimal getTransportationFare(
        String fromLocation,
        String toLocation) {

    return transportFareService.findFare(
            fromLocation,
            toLocation
    );
}

    // Calculate accommodation cost
public BigDecimal calculateAccommodationCost(
        BigDecimal pricePerNight,
        long numberOfNights) {

    if (pricePerNight == null || numberOfNights <= 0) {
        return BigDecimal.ZERO;
    }

    return pricePerNight.multiply(
            BigDecimal.valueOf(numberOfNights)
    );
}

// Calculate estimated food cost
public BigDecimal calculateFoodCost(
        BigDecimal foodPerDay,
        long numberOfDays) {

    if (foodPerDay == null || numberOfDays <= 0) {
        return BigDecimal.ZERO;
    }

    return foodPerDay.multiply(
            BigDecimal.valueOf(numberOfDays)
    );
}

// Calculate local public transportation cost
public BigDecimal calculateLocalTransportCost(
        BigDecimal costPerDay,
        long numberOfDays) {

    if (costPerDay == null || numberOfDays <= 0) {
        return BigDecimal.ZERO;
    }

    return costPerDay.multiply(
            BigDecimal.valueOf(numberOfDays)
    );
}

// Calculate miscellaneous expenses
public BigDecimal calculateMiscellaneousCost(
        BigDecimal baseAmount,
        BigDecimal percentage) {

    if (baseAmount == null || percentage == null) {
        return BigDecimal.ZERO;
    }

    return baseAmount
            .multiply(percentage)
            .divide(BigDecimal.valueOf(100));
}

    // Calculate complete trip budget
    public BigDecimal calculateTotalBudget(
            BigDecimal transportation,
            BigDecimal accommodation,
            BigDecimal food,
            BigDecimal entryFees,
            BigDecimal localTransport,
            BigDecimal miscellaneous) {

        return transportation
                .add(accommodation)
                .add(food)
                .add(entryFees)
                .add(localTransport)
                .add(miscellaneous);
    }
}