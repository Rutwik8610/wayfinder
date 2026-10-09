package com.tourism.backend.dto;

public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private String accessToken;
    private String tokenType;
    private long expiresIn;

    public AuthResponse(Long id, String name, String email, String accessToken, long expiresIn) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }
}