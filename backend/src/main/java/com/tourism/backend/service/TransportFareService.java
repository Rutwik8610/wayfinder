package com.tourism.backend.service;

import com.tourism.backend.entity.TransportFare;
import com.tourism.backend.repository.TransportFareRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
public class TransportFareService {

    private final TransportFareRepository transportFareRepository;

    public TransportFareService(
            TransportFareRepository transportFareRepository) {

        this.transportFareRepository = transportFareRepository;
    }

    public BigDecimal findFare(
        String fromLocation,
        String toLocation) {

    return transportFareRepository
            .findFirstByFromLocationIgnoreCaseAndToLocationIgnoreCase(
                    fromLocation,
                    toLocation
            )
            .map(TransportFare::getFare)
            .orElse(BigDecimal.ZERO);
}
}