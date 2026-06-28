package com.cafe.cafebackend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cafe.cafebackend.dto.RegisterRequest;
import com.cafe.cafebackend.entity.Order;
import com.cafe.cafebackend.service.AdminService;
import com.cafe.cafebackend.service.OrderService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/login")
    public String loginAdmin(@RequestBody RegisterRequest request) {
        return adminService.loginAdmin(request);
    }

    @GetMapping("/pending-orders")
    public List<Order> getPendingOrders() {
        return orderService.getPendingOrders();
    }

    @GetMapping("/preparing-orders")
    public List<Order> getPreparingOrders() {
        return orderService.getPreparingOrders();
    }

    @PutMapping("/approve-payment/{orderId}")
    public String approvePayment(@PathVariable Long orderId) {
        return adminService.approvePayment(orderId);
    }

    @PutMapping("/complete-order/{orderId}")
    public String completeOrder(@PathVariable Long orderId) {
        return adminService.completeOrder(orderId);
    }

    @GetMapping("/statistics")
    public Map<String, Object> getOrderStatistics() {
        return adminService.getOrderStatistics();
    }

    @GetMapping("/daily-count")
    public Map<String, Long> getDailyOrderCount() {
        return adminService.getDailyOrderCount();
    }

    @GetMapping("/monthly-count")
    public Map<String, Long> getMonthlyOrderCount() {
        return adminService.getMonthlyOrderCount();
    }
}
