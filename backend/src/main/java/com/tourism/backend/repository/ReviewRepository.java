package com.tourism.backend.repository;

import com.tourism.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTouristSpotId(Long touristSpotId);
}