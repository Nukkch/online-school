package com.school.backend.repository;

import com.school.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // Поиск всех курсов конкретного преподавателя
    List<Course> findByTeacherId(Long teacherId);
}