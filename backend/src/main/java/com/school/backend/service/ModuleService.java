package com.school.backend.service;

import com.school.backend.dto.LessonResponse;
import com.school.backend.dto.ModuleCreateRequest;
import com.school.backend.dto.ModuleResponse;
import com.school.backend.entity.Course;
import com.school.backend.entity.Lesson;
import com.school.backend.entity.Module;
import com.school.backend.repository.CourseRepository;
import com.school.backend.repository.LessonRepository;
import com.school.backend.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository; 

    public ModuleResponse createModule(ModuleCreateRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        return mapToResponse(moduleRepository.save(module));
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> getModulesByCourseIdWithLessons(Long courseId) {
        List<Module> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        
        return modules.stream().map(module -> {
            List<LessonResponse> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId())
                    .stream()
                    .map(lesson -> LessonResponse.builder()
                            .id(lesson.getId())
                            .title(lesson.getTitle())
                            .content(lesson.getContent())
                            .orderIndex(lesson.getOrderIndex())
                            .moduleId(lesson.getModule().getId())
                            .build())
                    .toList();
            
            return ModuleResponse.builder()
                    .id(module.getId())
                    .title(module.getTitle())
                    .description(module.getDescription())
                    .orderIndex(module.getOrderIndex())
                    .courseId(module.getCourse().getId())
                    .lessons(lessons)
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> getModulesByCourseId(Long courseId) {
        return moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ModuleResponse mapToResponse(Module module) {
        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .courseId(module.getCourse().getId())
                .build();
    }
        @Transactional
    public void deleteModule(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Модуль не найден"));
        moduleRepository.delete(module);
    }
}