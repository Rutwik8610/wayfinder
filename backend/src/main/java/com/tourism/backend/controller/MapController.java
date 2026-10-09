package com.tourism.backend.controller;

import com.tourism.backend.service.MapGeocodingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/map")
public class MapController {

    private final MapGeocodingService mapGeocodingService;

    public MapController(MapGeocodingService mapGeocodingService) {
        this.mapGeocodingService = mapGeocodingService;
    }

    @GetMapping("/geocode")
    public MapGeocodingService.GeocodedPlace geocode(@RequestParam("q") String query) {
        return mapGeocodingService.geocode(query);
    }
}
