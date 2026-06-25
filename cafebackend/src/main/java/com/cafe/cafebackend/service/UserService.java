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

        User existingUser =
                userRepository.findByEmail(
                        request.getEmail());

        if(existingUser != null) {

            return "Email Already Exists";
        }

        User user = new User();

        user.setName(request.getName());

        user.setEmail(request.getEmail());

        user.setPassword(request.getPassword());

        user.setRole("CUSTOMER");

        userRepository.save(user);

        return "User Registered Successfully";
    }

    public String login(RegisterRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail());

        if(user == null) {

            return "User Not Found";
        }

        if(!user.getPassword().equals(
                request.getPassword())) {

            return "Invalid Password";
        }

        return "Login Successful";
    }
}