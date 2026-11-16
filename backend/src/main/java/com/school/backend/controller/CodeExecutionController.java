package com.school.backend.controller;

import com.school.backend.dto.CodeExecutionResponse;
import com.school.backend.dto.CodeSubmissionRequest;
import com.school.backend.service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResponse> executeCode(@RequestBody CodeSubmissionRequest request) {
        CodeExecutionResponse response = codeExecutionService.executeCode(request);
        return ResponseEntity.ok(response);
    }
}