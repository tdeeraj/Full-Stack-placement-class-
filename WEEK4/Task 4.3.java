package com.example.demo;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

interface PaymentService {
    String paymentStatus();
}

@Service
class PaymentServiceImpl implements PaymentService {

    public String paymentStatus() {
        return "Payment processed successfully";
    }
}

@RestController
class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/payment")
    public String checkPayment() {
        return paymentService.paymentStatus();
    }
}
