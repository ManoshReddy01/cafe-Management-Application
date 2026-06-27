package com.cafe.cafebackend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cafe.cafebackend.entity.Menu;
import com.cafe.cafebackend.repository.MenuRepository;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    public String addMenu(Menu menu) {

    System.out.println("===== ADD MENU REQUEST =====");
    System.out.println("Category: " + menu.getCategory());
    System.out.println("Item: " + menu.getItemName());
    System.out.println("Price: " + menu.getPrice());

    menuRepository.save(menu);

    System.out.println("Menu saved successfully.");
    System.out.println("Total Menu Items: " + menuRepository.count());

    return "Menu Item Added Successfully";
}

    public List<Menu> getAllMenus() {

        return menuRepository.findAll();
    }

    public String deleteMenu(Long id) {

        menuRepository.deleteById(id);

        return "Menu Deleted Successfully";
    }
}