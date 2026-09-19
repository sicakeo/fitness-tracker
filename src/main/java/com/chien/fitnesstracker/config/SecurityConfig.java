package com.chien.fitnesstracker.config;

import com.chien.fitnesstracker.security.JwtAuthFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;




@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Whitelist all your clean URLs and static files here
                .requestMatchers(
                    "/",
                    "/index", "/index.html",
                    "/login", "/login.html",
                    "/register", "/register.html",
                    "/bmi-calculator", "/bmi-calculator.html",
                    "/bmr-calculator", "/bmr-calculator.html",
                    "/tdee-calculator", "/tdee-calculator.html",
                    "/profile", "/profile.html",
                    "/home", "/home.html",
                    "/about", "/about.html",
                    "/tools", "/tools.html",
                    "/contact", "/contact.html",
                    "/settings", "/settings.html",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/api/users/**",
                    "/api/auth/**",
                    "/api/exercises/**",
                    "/api/workout-sessions/**",
                    "/api/workout-sessions/history/**",
                    "/api/workout-entries/**",
                    "/api/food-entries/**",
                    "/error", "/error.html"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .addFilterBefore(jwtAuthFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}