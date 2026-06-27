package com.cafe.cafebackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cafe.cafebackend.dto.RegisterRequest;
import com.cafe.cafebackend.entity.User;
import com.cafe.cafebackend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String register(RegisterRequest request) {

        System.out.println("===== REGISTER REQUEST =====");
        System.out.println("Name : " + request.getName());
        System.out.println("Email: " + request.getEmail());

        User existingUser = userRepository.findByEmail(request.getEmail());

        if(existingUser != null) {
            System.out.println("Email already exists in database.");
            return "Email Already Exists";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("CUSTOMER");

        userRepository.save(user);

        System.out.println("User saved successfully.");
        System.out.println("Total Users : " + userRepository.count());

        return "User Registered Successfully";
    }

    public String login(RegisterRequest request) {

        System.out.println("===== LOGIN REQUEST =====");
        System.out.println("Email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail());

        if(user == null) {
            System.out.println("User not found in database.");
            return "User Not Found";
        }

        System.out.println("User found: " + user.getEmail());

        if(!user.getPassword().equals(request.getPassword())) {
            System.out.println("Invalid password.");
            return "Invalid Password";
        }

        System.out.println("Login successful.");

        return "Login Successful";
    }
}