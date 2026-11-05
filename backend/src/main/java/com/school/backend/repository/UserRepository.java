package com.school.backend.repository;

import com.school.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Ищет пользователя по email (возвращает Optional, так как пользователя может не быть)
    Optional<User> findByEmail(String email);
    
    // Проверяет, существует ли пользователь с таким email (нужно для регистрации)
    boolean existsByEmail(String email);
}