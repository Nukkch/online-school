package com.school.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResponse {
    private String output;
    private String stderr;
    private String compileOutput;
    private Integer status;
    private Double time;
    private Integer memory;
}