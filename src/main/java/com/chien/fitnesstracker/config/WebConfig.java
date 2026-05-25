package com.chien.fitnesstracker.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry){
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3300")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward http://localhost:8080/login directly to login.html
        registry.addViewController("/login").setViewName("forward:/login.html");
        
        // Forward http://localhost:8080/register directly to register.html
        registry.addViewController("/register").setViewName("forward:/register.html");
        
        // Forward http://localhost:8080/ (root URL) directly to your home or index dashboard
        registry.addViewController("/").setViewName("forward:/index.html");
        
        registry.addViewController("/bmi-calculator").setViewName("forward:/bmi-calculator.html");

        registry.addViewController("/bmr-calculator").setViewName("forward:/bmr-calculator.html");

        registry.addViewController("/profile").setViewName("forward:/profile.html");

        registry.addViewController("/home").setViewName("forward:/home.html");

        registry.addViewController("/signout").setViewName("forward:/.html");
    }
}
