package com.tourism.backend.controller;

import com.tourism.backend.entity.Review;
import com.tourism.backend.repository.ReviewRepository;
import com.tourism.backend.security.JwtPrincipal;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @PostMapping
    public Review addReview(@RequestBody Review review, @AuthenticationPrincipal JwtPrincipal principal) {

        review.setUserId(principal.userId());
        review.setCreatedAt(java.time.LocalDateTime.now());

        return reviewRepository.save(review);
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @GetMapping("/spot/{spotId}")
    public List<Review> getReviewsBySpot(
            @PathVariable Long spotId) {

        return reviewRepository.findByTouristSpotId(spotId);
    }
}