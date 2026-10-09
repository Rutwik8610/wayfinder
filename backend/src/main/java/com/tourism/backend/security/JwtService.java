package com.tourism.backend.security;

import com.tourism.backend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

@Service
public class JwtService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final long expirationSeconds;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-seconds:3600}") long expirationSeconds) {
        this.objectMapper = objectMapper;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        if (this.secret.length < 32) {
            throw new IllegalStateException(
                    "Configure app.jwt.secret with at least 32 bytes using the JWT_SECRET environment variable.");
        }
        if (expirationSeconds < 1) {
            throw new IllegalStateException("app.jwt.expiration-seconds must be positive.");
        }
        this.expirationSeconds = expirationSeconds;
    }

    public String createToken(User user) {
        long issuedAt = Instant.now().getEpochSecond();
        String header = encodeJson("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = encodeJson(
                "{\"sub\":" + quote(user.getEmail())
                        + ",\"userId\":" + user.getId()
                        + ",\"name\":" + quote(user.getName())
                        + ",\"iat\":" + issuedAt
                        + ",\"exp\":" + (issuedAt + expirationSeconds)
                        + "}");
        String unsignedToken = header + "." + payload;
        return unsignedToken + "." + ENCODER.encodeToString(sign(unsignedToken));
    }

    public JwtPrincipal verifyToken(String token) {
        String[] parts = token.split("\\.", -1);
        if (parts.length != 3) {
            throw new InvalidJwtException();
        }

        try {
            JsonNode header = objectMapper.readTree(DECODER.decode(parts[0]));
            JsonNode claims = objectMapper.readTree(DECODER.decode(parts[1]));
            byte[] suppliedSignature = DECODER.decode(parts[2]);
            byte[] expectedSignature = sign(parts[0] + "." + parts[1]);

            if (!"HS256".equals(header.path("alg").asText())
                    || !MessageDigest.isEqual(expectedSignature, suppliedSignature)) {
                throw new InvalidJwtException();
            }

            long userId = claims.path("userId").asLong(0);
            long expiration = claims.path("exp").asLong(0);
            String email = claims.path("sub").asText("");
            String name = claims.path("name").asText("");
            if (userId < 1 || email.isBlank() || expiration <= Instant.now().getEpochSecond()) {
                throw new InvalidJwtException();
            }
            return new JwtPrincipal(userId, email, name);
        } catch (InvalidJwtException exception) {
            throw exception;
        } catch (IllegalArgumentException | JacksonException exception) {
            throw new InvalidJwtException();
        }
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private String encodeJson(String json) {
        return ENCODER.encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private String quote(String value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Unable to encode JWT claim.", exception);
        }
    }

    private byte[] sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret, HMAC_SHA256));
            return mac.doFinal(value.getBytes(StandardCharsets.US_ASCII));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to sign access token.", exception);
        }
    }
}
