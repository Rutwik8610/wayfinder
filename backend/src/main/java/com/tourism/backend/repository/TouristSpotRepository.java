package com.tourism.backend.repository;

import com.tourism.backend.entity.TouristSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TouristSpotRepository
        extends JpaRepository<TouristSpot, Long> {

    List<TouristSpot> findByNameContainingIgnoreCase(String name);
    List<TouristSpot> findByCityContainingIgnoreCase(String city);
    List<TouristSpot> findByInterestsContainingIgnoreCase(String interest);
    java.util.Optional<TouristSpot> findFirstByNameIgnoreCase(String name);
    List<TouristSpot> findByCityIgnoreCase(String city);
}