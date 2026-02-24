package com.week4.task46;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
public class Task46Application implements CommandLineRunner {

    @Autowired
    private ApplicationContext applicationContext;

    public static void main(String[] args) {
        SpringApplication.run(Task46Application.class, args);
    }

    @Override
    public void run(String... args) {
        System.out.println("\n" + "═".repeat(55));
        System.out.println("  Task 4.6 — BeanFactory Demo");
        System.out.println("═".repeat(55));

        var beanFactory = applicationContext;

        System.out.println("Bean 'employeeService'    exists: " +
                beanFactory.containsBean("employeeService"));
        System.out.println("Bean 'employeeRepository' exists: " +
                beanFactory.containsBean("employeeRepository"));

        EmployeeService svc = beanFactory.getBean(EmployeeService.class);
        System.out.println("Employees loaded: " + svc.getAllEmployees().size());
        System.out.println("═".repeat(55));
        System.out.println("  Visit: http://localhost:8085/employees\n");
    }
}

class Employee {
    private int id;
    private String name;
    private String department;
    private double salary;

    public Employee(int id, String name, String department, double salary) {
        this.id         = id;
        this.name       = name;
        this.department = department;
        this.salary     = salary;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }

    @Override
    public String toString() {
        return "Employee{id=" + id + ", name='" + name +
               "', dept='" + department + "', salary=" + salary + "}";
    }
}

@Repository
class EmployeeRepository {

    private final List<Employee> employees = new ArrayList<>(Arrays.asList(
        new Employee(1, "Ravi Kumar",   "IT",      72000),
        new Employee(2, "Priya Sharma", "Finance", 65000),
        new Employee(3, "Arjun Singh",  "IT",      80000),
        new Employee(4, "Meena Patel",  "HR",      58000)
    ));

    public List<Employee> findAll() {
        return employees;
    }

    public Optional<Employee> findById(int id) {
        return employees.stream().filter(e -> e.getId() == id).findFirst();
    }

    public List<Employee> findByDepartment(String dept) {
        return employees.stream()
                .filter(e -> e.getDepartment().equalsIgnoreCase(dept))
                .collect(Collectors.toList());
    }

    public void save(Employee emp) {
        employees.add(emp);
    }
}

@Service
class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public String getEmployeeById(int id) {
        return employeeRepository.findById(id)
                .map(Employee::toString)
                .orElse("Employee with ID " + id + " not found.");
    }

    public List<Employee> getByDepartment(String dept) {
        return employeeRepository.findByDepartment(dept);
    }

    public String addEmployee(int id, String name, String dept, double salary) {
        Employee emp = new Employee(id, name, dept, salary);
        employeeRepository.save(emp);
        return "Employee added: " + emp;
    }
}

@RestController
@RequestMapping("/employees")
class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public String getById(@PathVariable int id) {
        return employeeService.getEmployeeById(id);
    }

    @GetMapping("/dept/{dept}")
    public List<Employee> getByDept(@PathVariable String dept) {
        return employeeService.getByDepartment(dept);
    }

    @PostMapping("/add")
    public String addEmployee(@RequestParam int id,
                              @RequestParam String name,
                              @RequestParam String dept,
                              @RequestParam double salary) {
        return employeeService.addEmployee(id, name, dept, salary);
    }
}