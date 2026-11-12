package com.school.backend.controller;

import com.school.backend.dto.LessonCreateRequest;
import com.school.backend.dto.LessonResponse;
import com.school.backend.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(@RequestBody LessonCreateRequest request) {
        return ResponseEntity.ok(lessonService.createLesson(request));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<LessonResponse>> getLessonsByModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(lessonService.getLessonsByModuleId(moduleId));
    }
        @DeleteMapping("/{lessonId}")
    public ResponseEntity<String> deleteLesson(@PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.ok("Урок удален");
    }
        @GetMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> getLessonById(@PathVariable Long lessonId) {
        return ResponseEntity.ok(lessonService.getLessonById(lessonId));
    }
}