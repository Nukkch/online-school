package com.school.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @GetMapping
    public ResponseEntity<String> getProfile() {
        // Достаем имя текущего авторизованного пользователя из контекста безопасности
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = authentication.getName();
        
        return ResponseEntity.ok("Привет, " + currentUserName + "! Твой токен работает отлично!");
    }
}