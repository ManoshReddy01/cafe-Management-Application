package com.cafe.cafebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cafe.cafebackend.entity.Menu;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

}