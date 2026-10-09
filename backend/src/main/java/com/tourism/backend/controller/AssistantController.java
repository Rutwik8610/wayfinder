package com.tourism.backend.controller;

import com.tourism.backend.dto.AssistantChatRequest;
import com.tourism.backend.dto.AssistantChatResponse;
import com.tourism.backend.service.AssistantService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin
public class AssistantController {

    private final AssistantService assistantService;

    public AssistantController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponse> chat(
            @RequestBody AssistantChatRequest request,
            HttpServletRequest httpServletRequest) {

        String clientIp = extractClientIp(httpServletRequest);
        AssistantChatResponse response = assistantService.processChat(request, clientIp);
        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
