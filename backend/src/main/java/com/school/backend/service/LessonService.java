package com.school.backend.service;

import com.school.backend.dto.LessonCreateRequest;
import com.school.backend.dto.LessonResponse;
import com.school.backend.entity.Lesson;
import com.school.backend.entity.Module;
import com.school.backend.repository.LessonRepository;
import com.school.backend.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;

    public LessonResponse createLesson(LessonCreateRequest request) {
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Модуль не найден"));

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .orderIndex(request.getOrderIndex())
                .language(request.getLanguage())
                .codeTemplate(request.getCodeTemplate())
                .module(module)
                .build();

        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByModuleId(Long moduleId) {
        return lessonRepository.findByModuleIdOrderByOrderIndexAsc(moduleId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .moduleId(lesson.getModule().getId())
                .build();
    }
        @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Урок не найден"));
        lessonRepository.delete(lesson);
    }
}