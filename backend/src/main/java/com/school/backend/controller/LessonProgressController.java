package com.school.backend.controller;

import com.school.backend.dto.LessonProgressResponse;
import com.school.backend.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class LessonProgressController {

    private final LessonProgressService progressService;

    // Переключает статус прохождения урока (создает или обновляет)
    @PostMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonProgressResponse> toggleLessonProgress(@PathVariable Long lessonId) {
        return ResponseEntity.ok(progressService.toggleProgress(lessonId));
    }
}