package com.cafe.cafebackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cafe.cafebackend.entity.Menu;
import com.cafe.cafebackend.service.MenuService;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin("*")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @PostMapping("/add")
    public String addMenu(
            @RequestBody Menu menu) {

        return menuService.addMenu(menu);
    }

    @GetMapping("/all")
    public List<Menu> getAllMenus() {

        return menuService.getAllMenus();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteMenu(
            @PathVariable Long id) {

        return menuService.deleteMenu(id);
    }
}