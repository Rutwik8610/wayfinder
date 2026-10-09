package com.tourism.backend.repository;

import com.tourism.backend.entity.TransportFare;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface TransportFareRepository
        extends JpaRepository<TransportFare, Long> {

    Optional<TransportFare> findFirstByFromLocationIgnoreCaseAndToLocationIgnoreCase(
        String fromLocation,
        String toLocation
);
}
