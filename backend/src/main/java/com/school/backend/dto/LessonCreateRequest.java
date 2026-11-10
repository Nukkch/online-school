package com.school.backend.dto;

import lombok.Data;

@Data
public class LessonCreateRequest {
    private String title;
    private String content;
    private Integer orderIndex;
    private Long moduleId;
}