package com.school.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonCreateRequest {
    private String title;
    private String content;
    private Integer orderIndex;
    private Long moduleId;
    private String language;
    private String codeTemplate;
}