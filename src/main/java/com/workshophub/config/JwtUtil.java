package com.workshophub.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility for generating and validating JWT tokens for stateless API authentication.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String secret;

    private static final long EXPIRY_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    private SecretKey getKey() {
        String effectiveSecret = (secret != null && secret.trim().length() >= 32)
                ? secret.trim()
                : "kaushalya-dev-local-only-jwt-secret-key-minimum-32-chars-ok!";
        return Keys.hmacShaKeyFor(effectiveSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String role, String userId) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(getKey())
                .compact();
    }

    public Claims validateAndParse(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return validateAndParse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            validateAndParse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
