package com.tourism.backend.security;

public record JwtPrincipal(Long userId, String email, String name) {
}
