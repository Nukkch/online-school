package com.school.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Judge0Response {
    private String stdout;
    private String stderr;
    @JsonProperty("compile_output")
    private String compileOutput;
    private Status status;
    private String time;
    private Integer memory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Status {
        private Integer id;
        private String description;
    }
}