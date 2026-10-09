package com.tourism.backend.security;

public class InvalidJwtException extends RuntimeException {

    public InvalidJwtException() {
        super("Invalid or expired access token");
    }
}
