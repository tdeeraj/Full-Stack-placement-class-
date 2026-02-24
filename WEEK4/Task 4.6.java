package com.week4.task47;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
public class Task47Application {
    public static void main(String[] args) {
        SpringApplication.run(Task47Application.class, args);
        System.out.println("\n" + "═".repeat(55));
        System.out.println("  Task 4.7 — Spring MVC (Annotation-Based, No XML)");
        System.out.println("═".repeat(55));
        System.out.println("  REST : GET http://localhost:8085/mvc/employees");
        System.out.println("  HTML : GET http://localhost:8085/view/employees");
        System.out.println("═".repeat(55) + "\n");
    }
}

class EmployeeModel {
    private int id;
    private String name;
    private String department;
    private String email;
    private double salary;

    public EmployeeModel() {}
    public EmployeeModel(int id, String name, String department,
                         String email, double salary) {
        this.id = id; this.name = name; this.department = department;
        this.email = email; this.salary = salary;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public String getDepartment() { return department; }
    public void setDepartment(String d) { this.department = d; }
    public String getEmail() { return email; }
    public void setEmail(String e) { this.email = e; }
    public double getSalary() { return salary; }
    public void setSalary(double s){ this.salary = s; }

    @Override
    public String toString() {
        return "Employee{id=" + id + ", name='" + name +
               "', dept='" + department + "', email='" + email +
               "', salary=" + salary + "}";
    }
}

@Component
class EmployeeMvcRepository {

    private final Map<Integer, EmployeeModel> store = new LinkedHashMap<>();

    public EmployeeMvcRepository() {
        store.put(1, new EmployeeModel(1, "Ravi Kumar",   "IT",      "ravi@company.com",   72000));
        store.put(2, new EmployeeModel(2, "Priya Sharma", "Finance", "priya@company.com",  65000));
        store.put(3, new EmployeeModel(3, "Arjun Singh",  "IT",      "arjun@company.com",  80000));
        store.put(4, new EmployeeModel(4, "Meena Patel",  "HR",      "meena@company.com",  58000));
        store.put(5, new EmployeeModel(5, "Kiran Das",    "Marketing","kiran@company.com", 61000));
    }

    public List<EmployeeModel> findAll() { return new ArrayList<>(store.values()); }
    public Optional<EmployeeModel> findById(int id) { return Optional.ofNullable(store.get(id)); }
    public List<EmployeeModel> findByName(String name) {
        return store.values().stream()
                .filter(e -> e.getName().toLowerCase().contains(name.toLowerCase()))
                .collect(Collectors.toList());
    }
    public List<EmployeeModel> findByDept(String dept) {
        return store.values().stream()
                .filter(e -> e.getDepartment().equalsIgnoreCase(dept))
                .collect(Collectors.toList());
    }
    public EmployeeModel save(EmployeeModel emp) { store.put(emp.getId(), emp); return emp; }
    public boolean delete(int id) { return store.remove(id) != null; }
}

@Service
class EmployeeMvcService {

    @Autowired
    private EmployeeMvcRepository repository;

    public List<EmployeeModel> getAll() { return repository.findAll(); }
    public Optional<EmployeeModel> getById(int id) { return repository.findById(id); }
    public List<EmployeeModel> searchByName(String name) { return repository.findByName(name); }
    public List<EmployeeModel> getByDept(String dept) { return repository.findByDept(dept); }
    public EmployeeModel create(EmployeeModel emp) { return repository.save(emp); }
    public boolean delete(int id) { return repository.delete(id); }
}

@RestController
@RequestMapping("/mvc/employees")
class EmployeeRestController {

    @Autowired
    private EmployeeMvcService service;

    @GetMapping
    public ResponseEntity<List<EmployeeModel>> getAll() { return ResponseEntity.ok(service.getAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return service.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<EmployeeModel>> search(@RequestParam String name) {
        List<EmployeeModel> results = service.searchByName(name);
        if (results.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/dept/{dept}")
    public ResponseEntity<List<EmployeeModel>> byDept(@PathVariable String dept) {
        return ResponseEntity.ok(service.getByDept(dept));
    }

    @PostMapping
    public ResponseEntity<EmployeeModel> create(@RequestBody EmployeeModel emp) {
        return ResponseEntity.ok(service.create(emp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        if (service.delete(id)) return ResponseEntity.ok("Employee " + id + " deleted.");
        return ResponseEntity.notFound().build();
    }
}

@org.springframework.stereotype.Controller
@RequestMapping("/view")
class EmployeeViewController {

    @Autowired
    private EmployeeMvcService service;

    @GetMapping("/employees")
    public String listEmployees(Model model) {
        model.addAttribute("employees", service.getAll());
        model.addAttribute("title", "Employee List — Spring MVC");
        model.addAttribute("total", service.getAll().size());
        return "employees";
    }

    @GetMapping("/employees/{id}")
    public String employeeDetail(@PathVariable int id, Model model) {
        Optional<EmployeeModel> emp = service.getById(id);
        if (emp.isPresent()) {
            model.addAttribute("employee", emp.get());
            model.addAttribute("title", "Employee Detail — " + emp.get().getName());
            return "employee-detail";
        }
        model.addAttribute("error", "Employee with ID " + id + " not found.");
        return "error";
    }
}