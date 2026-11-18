package com.bhashabridge.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", "Malformed request body");
    body.put("message", "Request body must be valid JSON");
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", "Validation failed");
    body.put("message", ex.getBindingResult().getFieldErrors().stream()
        .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
        .reduce((a, b) -> a + "; " + b)
        .orElse("Invalid request"));
    return ResponseEntity.badRequest().body(body);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", ex.getReason());
    return ResponseEntity.status(ex.getStatusCode()).body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
    Map<String, String> body = new HashMap<>();
    body.put("error", "Internal server error");
    return ResponseEntity.internalServerError().body(body);
  }
}
