package com.cafe.cafebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cafe.cafebackend.entity.User;

@Repository
public interface UserRepository
extends JpaRepository<User, Long> {

    User findByEmail(String email);
}