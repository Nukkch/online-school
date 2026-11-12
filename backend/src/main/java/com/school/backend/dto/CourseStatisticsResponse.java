package com.school.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseStatisticsResponse {
    private Long courseId;
    private String courseTitle;
    private Integer totalStudents;
    private Integer totalLessons;
    private List<StudentProgressDTO> students;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentProgressDTO {
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private Integer completedLessons;
        private Double progressPercentage;
    }
}