package com.tourism.backend.security;

import com.tourism.backend.entity.User;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTests {

    private final JwtService jwtService = new JwtService(
            new ObjectMapper(),
            "test-only-secret-with-at-least-32-bytes",
            3600);

    @Test
    void createsAndVerifiesBearerClaims() {
        User user = new User();
        user.setId(42L);
        user.setName("Taylor User");
        user.setEmail("taylor@example.com");

        JwtPrincipal principal = jwtService.verifyToken(jwtService.createToken(user));

        assertEquals(42L, principal.userId());
        assertEquals("taylor@example.com", principal.email());
        assertEquals("Taylor User", principal.name());
    }

    @Test
    void rejectsModifiedTokenClaims() {
        User user = new User();
        user.setId(42L);
        user.setName("Taylor User");
        user.setEmail("taylor@example.com");
        String[] tokenParts = jwtService.createToken(user).split("\\.");
        tokenParts[1] = (tokenParts[1].charAt(0) == 'A' ? "B" : "A") + tokenParts[1].substring(1);

        assertThrows(InvalidJwtException.class, () -> jwtService.verifyToken(String.join(".", tokenParts)));
    }

    @Test
    void rejectsMalformedToken() {
        assertThrows(InvalidJwtException.class, () -> jwtService.verifyToken("not-a-jwt"));
    }
}
