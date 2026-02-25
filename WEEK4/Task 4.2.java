package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Service
class StudentService {

    public String getMessage() {
        return "Service is working using @Autowired field injection";
    }
}

@RestController
class StudentController {

    @Autowired
    StudentService studentService;

    @GetMapping("/student")
    public String getStudent() {
        return studentService.getMessage();
    }
}
