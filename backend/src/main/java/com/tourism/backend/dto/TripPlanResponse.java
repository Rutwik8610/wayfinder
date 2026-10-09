package com.tourism.backend.dto;

import java.util.List;

public class TripPlanResponse {

    private SpotInfoResponse spotInfo;
    private RouteInfoResponse routeInfo;
    private List<ItineraryDayResponse> itinerary;
    private BudgetResponse budgetPlan;

    public TripPlanResponse(
            SpotInfoResponse spotInfo,
            RouteInfoResponse routeInfo,
            List<ItineraryDayResponse> itinerary,
            BudgetResponse budgetPlan) {
        this.spotInfo = spotInfo;
        this.routeInfo = routeInfo;
        this.itinerary = itinerary;
        this.budgetPlan = budgetPlan;
    }

    public TripPlanResponse(
            SpotInfoResponse spotInfo,
            List<ItineraryDayResponse> itinerary,
            BudgetResponse budgetPlan) {
        this(spotInfo, null, itinerary, budgetPlan);
    }

    public SpotInfoResponse getSpotInfo() {
        return spotInfo;
    }

    public RouteInfoResponse getRouteInfo() {
        return routeInfo;
    }

    public List<ItineraryDayResponse> getItinerary() {
        return itinerary;
    }

    public BudgetResponse getBudgetPlan() {
        return budgetPlan;
    }
}