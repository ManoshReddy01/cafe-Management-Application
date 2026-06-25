package com.cafe.cafebackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cafe.cafebackend.entity.Admin;
import com.cafe.cafebackend.entity.Order;
import com.cafe.cafebackend.dto.RegisterRequest;
import com.cafe.cafebackend.repository.AdminRepository;
import com.cafe.cafebackend.repository.OrderRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private OrderRepository orderRepository;

    public String loginAdmin(RegisterRequest request) {

        Admin admin = adminRepository.findByEmail(request.getEmail());

        if(admin == null) {
            return "Admin Not Found";
        }

        if(!admin.getPassword().equals(request.getPassword())) {
            return "Invalid Password";
        }

        return "Admin Login Successful";
    }

    public String approvePayment(Long orderId) {

        Order order = orderRepository.findById(orderId).orElse(null);

        if(order == null) {
            return "Order Not Found";
        }

        order.setPaymentStatus("COMPLETED");
        order.setOrderStatus("PREPARING");
        orderRepository.save(order);

        return "Payment Approved - Order Preparing";
    }

    public String completeOrder(Long orderId) {

        Order order = orderRepository.findById(orderId).orElse(null);

        if(order == null) {
            return "Order Not Found";
        }

        order.setOrderStatus("COMPLETED");
        orderRepository.save(order);

        return "Order Completed and Marked as Served";
    }

    public Map<String, Long> getDailyOrderCount() {

        Map<String, Long> dailyCount = new HashMap<>();
        LocalDate today = LocalDate.now();

        List<Order> allOrders = orderRepository.findAll();

        for(Order order : allOrders) {
            if(order.getOrderTime() != null) {
                LocalDate orderDate = order.getOrderTime().toLocalDate();
                if(orderDate.equals(today)) {
                    dailyCount.put("today", dailyCount.getOrDefault("today", 0L) + 1);
                }
            }
        }

        return dailyCount;
    }

    public Map<String, Long> getMonthlyOrderCount() {

        Map<String, Long> monthlyCount = new HashMap<>();
        YearMonth currentMonth = YearMonth.now();

        List<Order> allOrders = orderRepository.findAll();

        for(Order order : allOrders) {
            if(order.getOrderTime() != null) {
                YearMonth orderMonth = YearMonth.from(order.getOrderTime());
                if(orderMonth.equals(currentMonth)) {
                    monthlyCount.put("currentMonth", monthlyCount.getOrDefault("currentMonth", 0L) + 1);
                }
            }
        }

        return monthlyCount;
    }

    public Map<String, Object> getOrderStatistics() {

        Map<String, Object> stats = new HashMap<>();
        
        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.findByPaymentStatus("COMPLETED").size();
        long pendingOrders = orderRepository.findByPaymentStatus("PENDING").size();

        stats.put("totalOrders", totalOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("dailyCount", getDailyOrderCount());
        stats.put("monthlyCount", getMonthlyOrderCount());

        return stats;
    }
}
