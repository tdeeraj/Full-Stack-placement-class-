package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

interface NotificationService {
    String sendNotification();
}

@Service("emailService")
class EmailNotificationService implements NotificationService {

    public String sendNotification() {
        return "Email Notification Sent";
    }
}

@Service("smsService")
class SMSNotificationService implements NotificationService {

    public String sendNotification() {
        return "SMS Notification Sent";
    }
}

@RestController
class NotificationController {

    @Autowired
    @Qualifier("emailService")
    NotificationService notificationService;

    @GetMapping("/notify")
    public String notifyUser() {
        return notificationService.sendNotification();
    }
}
