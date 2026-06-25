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

        menuRepository.save(menu);

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