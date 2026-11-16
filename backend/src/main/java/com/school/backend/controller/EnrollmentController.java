package com.school.backend.controller;

import com.school.backend.dto.EnrollmentResponse;
import com.school.backend.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<String> enroll(@PathVariable Long courseId) {
        enrollmentService.enrollInCourse(courseId);
        return ResponseEntity.ok("Вы успешно записаны на курс!");
    }

    @GetMapping("/my")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments() {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments());
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<String> unenroll(@PathVariable Long courseId) {
        enrollmentService.unenrollFromCourse(courseId);
        return ResponseEntity.ok("Вы отписались от курса");
    }
}