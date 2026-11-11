package com.school.backend.service;

import com.school.backend.dto.EnrollmentResponse;
import com.school.backend.entity.Course;
import com.school.backend.entity.Enrollment;
import com.school.backend.entity.User;
import com.school.backend.repository.CourseRepository;
import com.school.backend.repository.EnrollmentRepository;
import com.school.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public void enrollInCourse(Long courseId) {
        // 1. Получаем текущего пользователя
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // 2. Проверяем существование курса
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        // 3. Проверяем, не записан ли уже
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new RuntimeException("Вы уже записаны на этот курс");
        }

        // 4. Создаем и сохраняем запись
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .build();

        enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
                
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(enrollment -> EnrollmentResponse.builder()
                        .id(enrollment.getId())
                        .courseId(enrollment.getCourse().getId())
                        .courseTitle(enrollment.getCourse().getTitle())
                        .enrolledAt(enrollment.getEnrolledAt())
                        .build())
                .toList();
    }
        @Transactional
    public void unenrollFromCourse(Long courseId) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Вы не записаны на этот курс"));

        enrollmentRepository.delete(enrollment);
    }
}