package com.tourism.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
public class MapGeocodingService {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private static final long MIN_REQUEST_INTERVAL_NANOS = Duration.ofSeconds(1).toNanos();

    private final RestClient restClient = RestClient.create();
    private final String referer;
    private long lastRequestStartedAt;

    public MapGeocodingService(
            @Value("${app.cors.allowed-origin:http://localhost:3000}") String frontendOrigin) {
        this.referer = frontendOrigin.endsWith("/") ? frontendOrigin : frontendOrigin + "/";
    }

    public GeocodedPlace geocode(String query) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isEmpty() || normalizedQuery.length() > 200) {
            throw new ResponseStatusException(BAD_REQUEST, "Enter a place name of at most 200 characters.");
        }

        waitForRequestSlot();
        String encodedQuery = URLEncoder.encode(normalizedQuery, StandardCharsets.UTF_8);
        URI uri = URI.create(NOMINATIM_URL + "?format=jsonv2&limit=1&q=" + encodedQuery);

        try {
            List<Map<String, Object>> response = restClient.get()
                    .uri(uri)
                    .header(HttpHeaders.USER_AGENT, "WayfarerTravelApp/1.0")
                    .header("Referer", referer)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() { });

            if (response == null || response.isEmpty()) {
                throw new ResponseStatusException(NOT_FOUND, "Place not found.");
            }

            Map<String, Object> place = response.get(0);
            return new GeocodedPlace(
                    String.valueOf(place.get("display_name")),
                    Double.parseDouble(String.valueOf(place.get("lat"))),
                    Double.parseDouble(String.valueOf(place.get("lon")))
            );
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(BAD_GATEWAY, "The OpenStreetMap geocoding service is unavailable.", exception);
        }
    }

    private void waitForRequestSlot() {
        synchronized (this) {
            long remainingNanos = MIN_REQUEST_INTERVAL_NANOS - (System.nanoTime() - lastRequestStartedAt);
            if (lastRequestStartedAt != 0 && remainingNanos > 0) {
                try {
                    long millis = remainingNanos / 1_000_000;
                    int nanos = (int) (remainingNanos % 1_000_000);
                    Thread.sleep(millis, nanos);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    throw new ResponseStatusException(SERVICE_UNAVAILABLE, "Geocoding request was interrupted.", exception);
                }
            }
            lastRequestStartedAt = System.nanoTime();
        }
    }

    public record GeocodedPlace(String displayName, double latitude, double longitude) {
    }
}
