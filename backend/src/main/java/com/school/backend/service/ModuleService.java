package com.school.backend.service;

import com.school.backend.dto.ModuleCreateRequest;
import com.school.backend.dto.ModuleResponse;
import com.school.backend.entity.Course;
import com.school.backend.entity.Module;
import com.school.backend.repository.CourseRepository;
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

    public ModuleResponse createModule(ModuleCreateRequest request) {
        // Находим курс, к которому привязываем модуль
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        Module savedModule = moduleRepository.save(module);
        return mapToResponse(savedModule);
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
}