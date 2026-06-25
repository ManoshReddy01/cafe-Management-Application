package com.cafe.cafebackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cafe.cafebackend.entity.Order;
import com.cafe.cafebackend.service.OrderService;

@RestController
@RequestMapping("/api/order")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public String placeOrder(
            @RequestBody Order order) {

        return orderService.placeOrder(order);
    }

    @GetMapping("/all")
    public List<Order> getAllOrders() {

        return orderService.getAllOrders();
    }

    @GetMapping("/pending")
    public List<Order> getPendingOrders() {

        return orderService.getPendingOrders();
    }

    @GetMapping("/track/{customerId}")
    public List<Order> trackOrder(@PathVariable String customerId) {

        return orderService.getOrdersByCustomer(customerId);
    }
}