package com.tourism.backend.dto;

import com.tourism.backend.entity.TouristSpot;

import java.math.BigDecimal;

public class SpotInfoResponse {

    private Long id;
    private String name;
    private String city;
    private String state;
    private String country;
    private String description;
    private String bestTimeToVisit;
    private BigDecimal entryFee;
    private String openingTime;
    private String closingTime;
    private String attractions;
    private String imageUrl;

    public SpotInfoResponse(TouristSpot spot) {
        this.id = spot.getId();
        this.name = spot.getName();
        this.city = spot.getCity();
        this.state = spot.getState();
        this.country = spot.getCountry();
        this.description = spot.getDescription();
        this.bestTimeToVisit = spot.getBestTimeToVisit();
        this.entryFee = spot.getEntryFee();
        this.openingTime = spot.getOpeningTime() == null ? null : spot.getOpeningTime().toString();
        this.closingTime = spot.getClosingTime() == null ? null : spot.getClosingTime().toString();
        this.attractions = spot.getAttractions();
        this.imageUrl = spot.getImageUrl();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getCountry() {
        return country;
    }

    public String getDescription() {
        return description;
    }

    public String getBestTimeToVisit() {
        return bestTimeToVisit;
    }

    public BigDecimal getEntryFee() {
        return entryFee;
    }

    public String getOpeningTime() {
        return openingTime;
    }

    public String getClosingTime() {
        return closingTime;
    }

    public String getAttractions() {
        return attractions;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}