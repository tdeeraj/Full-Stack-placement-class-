package com.week4.task44_45;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class Task44_45Application {
    public static void main(String[] args) {
        SpringApplication.run(Task44_45Application.class, args);
        System.out.println("Task 4.4 & 4.5 — Qualifier + Optional Injection started");
    }
}

interface NotificationService {
    String send(String message);
}

@Service("emailService")
class EmailNotificationService implements NotificationService {

    @Override
    public String send(String message) {
        return "📧 EMAIL sent: [" + message + "] → user@example.com";
    }
}

@Service("smsService")
class SMSNotificationService implements NotificationService {

    @Override
    public String send(String message) {
        return "📱 SMS sent:   [" + message + "] → +91-98765-43210";
    }
}

@RestController
@RequestMapping("/notify")
class NotificationController {

    @Autowired
    @Qualifier("emailService")
    private NotificationService emailService;

    @Autowired
    @Qualifier("smsService")
    private NotificationService smsService;

    @Autowired(required = false)
    private AnalyticsService analyticsService;

    @GetMapping("/email")
    public String notifyEmail() {
        return emailService.send("Your order has been confirmed!");
    }

    @GetMapping("/sms")
    public String notifySms() {
        return smsService.send("OTP: 482910 — valid for 10 mins.");
    }

    @GetMapping("/both")
    public String notifyBoth() {
        return emailService.send("Invoice ready") + "\n" +
               smsService.send("Invoice ready");
    }

    @GetMapping("/analytics")
    public String analytics() {
        if (analyticsService == null) {
            return "ℹ️  AnalyticsService is NOT present (optional bean is null). Application continues to work normally without it.";
        }
        return analyticsService.track("NotificationController.analytics called");
    }
}

@Component
class AnalyticsService {

    public String track(String event) {
        return "📊 Analytics tracked: [" + event + "] at " + java.time.LocalDateTime.now();
    }
}