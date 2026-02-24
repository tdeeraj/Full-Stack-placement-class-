package com.week4.task41;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@SpringBootApplication
public class Task41Application {
    public static void main(String[] args) {
        SpringApplication.run(Task41Application.class, args);
        System.out.println("Task 4.1 — Embedded Tomcat started on port 8085");
        System.out.println("Visit: http://localhost:8085/hello");
    }
}
@RestController
class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello from Spring Boot Servlet Container! Tomcat is running.";
    }
    @GetMapping("/info")
    public String info() {
        return "Spring Boot App | Embedded Tomcat | Port: 8085 | Servlet-based Architecture";
    }
}