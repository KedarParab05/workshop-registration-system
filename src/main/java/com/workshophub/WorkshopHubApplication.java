package com.workshophub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * Main Spring Boot application entry point for WorkshopHub.
 * Extends SpringBootServletInitializer to support WAR packaging and embedded Tomcat JSP compilation.
 */
@SpringBootApplication
public class WorkshopHubApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(WorkshopHubApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(WorkshopHubApplication.class, args);
    }
}
