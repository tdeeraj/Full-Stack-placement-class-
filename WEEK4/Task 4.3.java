
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// ── Entry point ───────────────────────────────────────────────────────────────
@SpringBootApplication
public class Task43Application {
    public static void main(String[] args) {
        SpringApplication.run(Task43Application.class, args);
        System.out.println("✅ Task 4.3 — Constructor Injection started on port 8085");
        System.out.println("   Test: GET http://localhost:8085/payment/process/500.00");
    }
}

// ── Interface: PaymentService ─────────────────────────────────────────────────
// Defines the contract — controller depends on this abstraction, not the class.
interface PaymentService {
    String processPayment(double amount);
    String getPaymentStatus();
}

// ── Implementation: PaymentServiceImpl ───────────────────────────────────────
// @Service registers this bean in Spring context.
// PaymentServiceImpl "IS-A" PaymentService.
@Service
class PaymentServiceImpl implements PaymentService {

    @Override
    public String processPayment(double amount) {
        if (amount <= 0) {
            return "❌ Invalid payment amount: " + amount;
        }
        return "✅ Payment of ₹" + amount + " processed successfully via PaymentServiceImpl.";
    }

    @Override
    public String getPaymentStatus() {
        return "Payment Gateway: ONLINE | Mode: UPI | Status: ACTIVE";
    }
}

// ── Controller with CONSTRUCTOR INJECTION ─────────────────────────────────────
// ★ Constructor Injection:
//   - Dependencies declared as final fields (immutable after construction)
//   - @Autowired on the constructor — Spring passes the PaymentService bean
//   - Preferred style: makes dependencies explicit, enables easier unit testing
//   - Note: If a class has only ONE constructor, @Autowired is optional (Spring infers it)
@RestController
@RequestMapping("/payment")
class PaymentController {

    // final = cannot be changed after injection (immutability)
    private final PaymentService paymentService;

    // ★ @Autowired on Constructor — Spring resolves and injects PaymentServiceImpl
    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
        System.out.println("PaymentController created — PaymentService injected via constructor.");
    }

    // GET /payment/process/{amount}
    @GetMapping("/process/{amount}")
    public String process(@PathVariable double amount) {
        return paymentService.processPayment(amount);
    }

    // GET /payment/status
    @GetMapping("/status")
    public String status() {
        return paymentService.getPaymentStatus();
    }
}
