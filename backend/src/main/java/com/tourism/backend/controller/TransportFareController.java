package com.tourism.backend.controller;

import com.tourism.backend.service.TransportFareService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/transport-fares")
public class TransportFareController {

    private final TransportFareService transportFareService;

    public TransportFareController(
            TransportFareService transportFareService) {

        this.transportFareService = transportFareService;
    }

    @GetMapping("/search")
    public BigDecimal getFare(
            @RequestParam String from,
            @RequestParam String to) {

        return transportFareService.findFare(from, to);
    }
}