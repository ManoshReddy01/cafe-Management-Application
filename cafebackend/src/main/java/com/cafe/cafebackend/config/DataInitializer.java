package com.cafe.cafebackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.cafe.cafebackend.entity.Admin;
import com.cafe.cafebackend.repository.AdminRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public void run(String... args) throws Exception {
        Admin existingAdmin = adminRepository.findByEmail(AdminConstants.DEFAULT_ADMIN_EMAIL);

        if (existingAdmin == null) {
            Admin defaultAdmin = new Admin();
            defaultAdmin.setName(AdminConstants.DEFAULT_ADMIN_NAME);
            defaultAdmin.setEmail(AdminConstants.DEFAULT_ADMIN_EMAIL);
            defaultAdmin.setPassword(AdminConstants.DEFAULT_ADMIN_PASSWORD);

            adminRepository.save(defaultAdmin);
            System.out.println("Default admin created: " + AdminConstants.DEFAULT_ADMIN_EMAIL + " / " + AdminConstants.DEFAULT_ADMIN_PASSWORD);
        } else {
            System.out.println("Default admin already exists");
        }
    }
}
