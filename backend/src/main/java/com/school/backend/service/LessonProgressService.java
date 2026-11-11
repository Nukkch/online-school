package com.school.backend.service;

import com.school.backend.dto.LessonProgressResponse;
import com.school.backend.entity.Lesson;
import com.school.backend.entity.LessonProgress;
import com.school.backend.entity.User;
import com.school.backend.repository.LessonProgressRepository;
import com.school.backend.repository.LessonRepository;
import com.school.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final LessonProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    @Transactional
    public LessonProgressResponse toggleProgress(Long lessonId) {
        // 1. Получаем текущего студента
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // 2. Находим урок
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Урок не найден"));

        // 3. Проверяем, есть ли уже запись о прогрессе
        Optional<LessonProgress> existingProgress = progressRepository.findByStudentIdAndLessonId(student.getId(), lessonId);

        if (existingProgress.isPresent()) {
            // Если есть - переключаем статус (было true -> стало false, и наоборот)
            LessonProgress progress = existingProgress.get();
            boolean newStatus = !progress.getCompleted();
            progress.setCompleted(newStatus);
            progress.setCompletedAt(newStatus ? LocalDateTime.now() : null);
            return mapToResponse(progressRepository.save(progress));
        } else {
            // Если нет - создаем новую запись со статусом "пройдено"
            LessonProgress newProgress = LessonProgress.builder()
                    .student(student)
                    .lesson(lesson)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build();
            return mapToResponse(progressRepository.save(newProgress));
        }
    }
        @Transactional(readOnly = true)
    public List<LessonProgressResponse> getProgressByCourseId(Long courseId) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        return progressRepository.findByStudentIdAndCourseId(student.getId(), courseId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LessonProgressResponse mapToResponse(LessonProgress progress) {
        return LessonProgressResponse.builder()
                .id(progress.getId())
                .lessonId(progress.getLesson().getId())
                .lessonTitle(progress.getLesson().getTitle())
                .completed(progress.getCompleted())
                .completedAt(progress.getCompletedAt())
                .build();
    }
}