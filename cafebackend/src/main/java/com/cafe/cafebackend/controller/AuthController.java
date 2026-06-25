package com.cafe.cafebackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cafe.cafebackend.dto.RegisterRequest;
import com.cafe.cafebackend.service.UserService;

@RestController

@RequestMapping("/api/auth")

@CrossOrigin(origins = "http://localhost:3000")

public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")

    public String register(
            @RequestBody RegisterRequest request) {

        return userService.register(request);
    }

    @PostMapping("/login")

    public String login(
            @RequestBody RegisterRequest request) {

        return userService.login(request);
    }
}