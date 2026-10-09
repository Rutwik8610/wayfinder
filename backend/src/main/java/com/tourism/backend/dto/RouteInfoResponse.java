package com.tourism.backend.dto;

public class RouteInfoResponse {

    private String origin;
    private String destination;
    private Double originLat;
    private Double originLng;
    private Double destinationLat;
    private Double destinationLng;
    private Double distanceKm;
    private String durationText;
    private String directionsUrl;
    private String embedMapUrl;

    public RouteInfoResponse() {
    }

    public RouteInfoResponse(
            String origin,
            String destination,
            Double originLat,
            Double originLng,
            Double destinationLat,
            Double destinationLng,
            Double distanceKm,
            String durationText,
            String directionsUrl,
            String embedMapUrl) {
        this.origin = origin;
        this.destination = destination;
        this.originLat = originLat;
        this.originLng = originLng;
        this.destinationLat = destinationLat;
        this.destinationLng = destinationLng;
        this.distanceKm = distanceKm;
        this.durationText = durationText;
        this.directionsUrl = directionsUrl;
        this.embedMapUrl = embedMapUrl;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public Double getOriginLat() {
        return originLat;
    }

    public Double getOriginLng() {
        return originLng;
    }

    public Double getDestinationLat() {
        return destinationLat;
    }

    public Double getDestinationLng() {
        return destinationLng;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public String getDurationText() {
        return durationText;
    }

    public String getDirectionsUrl() {
        return directionsUrl;
    }

    public String getEmbedMapUrl() {
        return embedMapUrl;
    }
}
