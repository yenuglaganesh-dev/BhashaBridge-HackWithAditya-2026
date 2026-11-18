package com.bhashabridge.controller;

import com.bhashabridge.dto.ChatRequest;
import com.bhashabridge.dto.ChatResponse;
import com.bhashabridge.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
  }

  @PostMapping("/chat")
  public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
    String response = chatService.chat(request.getMessage(), request.getLanguage());
    return ResponseEntity.ok(new ChatResponse(response));
  }
}
