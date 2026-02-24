package com.week4.task42;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class Task42Application {
    public static void main(String[] args) {
        SpringApplication.run(Task42Application.class, args);
        System.out.println("Task 4.2 — Field Injection started on port 8085");
    }
}

@Service
class GreetingService {

    public String greet(String name) {
        return "Hello, " + name + "! Welcome to Spring Boot with @Autowired field injection.";
    }

    public String defaultGreet() {
        return "Hello, World! Service is working correctly.";
    }
}

@RestController
class GreetingController {

    @Autowired
    private GreetingService greetingService;

    @GetMapping("/greet")
    public String greet() {
        return greetingService.defaultGreet();
    }

    @GetMapping("/greet/{name}")
    public String greetByName(@PathVariable String name) {
        return greetingService.greet(name);
    }
}