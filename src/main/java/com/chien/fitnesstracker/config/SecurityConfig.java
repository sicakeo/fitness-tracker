package com.chien.fitnesstracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
                    "/api/workouts/**",
                    "/api/food-entries/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable);

        return http.build();
    }
}