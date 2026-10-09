package com.tourism.backend.dto;

import java.util.List;

public class ItineraryDayResponse {

    private int day;
    private String date;
    private List<String> activities;

    public ItineraryDayResponse(int day, String date, List<String> activities) {
        this.day = day;
        this.date = date;
        this.activities = activities;
    }

    public int getDay() {
        return day;
    }

    public String getDate() {
        return date;
    }

    public List<String> getActivities() {
        return activities;
    }
}