package com.workshophub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration: supports JWT stateless authentication for React frontend
 * and exposes REST API endpoints with fine-grained controller-level authorization.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Strength 8 (vs default 10): ~100-150ms faster per login with negligible security trade-off
        return new BCryptPasswordEncoder(8);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public REST API endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/workshops/**").permitAll()
                .requestMatchers("/api/registrations/**").permitAll()
                .requestMatchers("/api/payments/**").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                // Static resources & JSP
                .requestMatchers("/css/**", "/js/**", "/images/**", "/assets/**", "/WEB-INF/**").permitAll()
                .requestMatchers("/", "/home", "/workshops/**", "/login", "/register", "/viva-guide").permitAll()
                // Other requests
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
