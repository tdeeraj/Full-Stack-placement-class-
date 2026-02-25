package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Component
class OptionalService {

    public String optionalMessage() {
        return "Optional service is available";
    }
}

@RestController
class OptionalController {

    @Autowired(required = false)
    OptionalService optionalService;

    @GetMapping("/optional")
    public String checkOptional() {

        if (optionalService != null) {
            return optionalService.optionalMessage();
        } else {
            return "Optional service is not available";
        }
    }
}
