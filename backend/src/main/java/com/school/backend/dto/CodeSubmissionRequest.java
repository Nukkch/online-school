package com.school.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmissionRequest {
    private String sourceCode;
    private String language;
    private String stdin; // входные данные (опционально)
}