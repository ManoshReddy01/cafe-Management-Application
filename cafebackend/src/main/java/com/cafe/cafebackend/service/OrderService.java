package com.cafe.cafebackend.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cafe.cafebackend.entity.Order;
import com.cafe.cafebackend.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public String placeOrder(Order order) {

        double total =
                order.getQuantity() * order.getPrice();

        order.setTotalAmount(total);
        order.setPaymentStatus("PENDING");
        order.setOrderStatus("PENDING");
        order.setOrderTime(LocalDateTime.now());

        orderRepository.save(order);

        return "Order Placed Successfully";
    }

    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    public List<Order> getPendingOrders() {

        return orderRepository.findByPaymentStatus("PENDING");
    }

    public List<Order> getPreparingOrders() {

        return orderRepository.findByOrderStatus("PREPARING");
    }

    public List<Order> getOrdersByCustomer(String customerName) {

        return orderRepository.findByCustomerName(customerName);
    }
}