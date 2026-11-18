package com.bhashabridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ChatRequest {

  private String message;
  private String language;

  public ChatRequest() {
  }

  public ChatRequest(String message, String language) {
    this.message = message;
    this.language = language;
  }

  @NotBlank(message = "Message is required")
  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  @NotBlank(message = "Language is required")
  @Pattern(regexp = "^(en|hi|te)$", message = "Language must be one of: en, hi, te")
  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }
}
