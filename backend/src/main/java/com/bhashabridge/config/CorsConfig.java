package com.bhashabridge.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

  @Value("${cors.allowed-origins:http://localhost:5173}")
  private List<String> allowedOrigins;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins(allowedOrigins.toArray(new String[0]))
        .allowedMethods("GET", "POST", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
