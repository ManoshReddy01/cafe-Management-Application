package com.cafe.cafebackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cafe.cafebackend.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPaymentStatus(String paymentStatus);
    List<Order> findByOrderStatus(String orderStatus);
    List<Order> findByCustomerName(String customerName);
}