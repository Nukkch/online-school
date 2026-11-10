package com.school.backend.dto;

import lombok.Data;

@Data
public class ModuleCreateRequest {
    private String title;
    private String description;
    private Integer orderIndex;
    private Long courseId; // ID курса, к которому привязываем модуль
}