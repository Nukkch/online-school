package com.school.backend.service;

import com.school.backend.dto.CourseCreateRequest;
import com.school.backend.dto.CourseResponse;
import com.school.backend.entity.Course;
import com.school.backend.entity.User;
import com.school.backend.repository.CourseRepository;
import com.school.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    // Создание курса при пост запросе
    public CourseResponse createCourse(CourseCreateRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .teacher(teacher)
                .build();

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    // Получить все курсы (для главной страницы)
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Получить только мои курсы (для кабинета преподавателя)
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
                
        return courseRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Вспомогательный метод для конвертации Entity в DTO
    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .teacherEmail(course.getTeacher().getEmail())
                .build();
    }
}