package com.bhashabridge.service;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ChatService {

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Value("${ai.service.url}")
  private String aiServiceUrl;

  public ChatService() {
    // Use the JDK HTTP client: the default HttpURLConnection refuses to read a
    // 4xx response (e.g. 401 invalid API key) on a streamed POST body.
    // Force HTTP/1.1 because uvicorn does not support h2c upgrade requests.
    HttpClient httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .connectTimeout(Duration.ofSeconds(10))
        .build();
    JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
    requestFactory.setReadTimeout(Duration.ofSeconds(60));

    this.restTemplate = new RestTemplate(requestFactory);
    // Do not let RestTemplate throw on 4xx/5xx: we need the AI engine's JSON
    // error body so we can forward its message and status code unchanged.
    this.restTemplate.setErrorHandler(new ResponseErrorHandler() {
      @Override
      public boolean hasError(ClientHttpResponse response) {
        return false;
      }

      @Override
      public void handleError(ClientHttpResponse response) {
        // Never called: hasError() always returns false.
      }
    });
  }

  public String chat(String message, String language) {
    Map<String, String> body = new HashMap<>();
    body.put("message", message);
    body.put("language", language);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

    ResponseEntity<String> response;
    try {
      response = restTemplate.postForEntity(aiServiceUrl + "/chat", entity, String.class);
    } catch (ResourceAccessException e) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "AI service is currently unavailable");
    }

    String responseBody = response.getBody();

    if (response.getStatusCode().is2xxSuccessful()) {
      String aiResponse = extractField(responseBody, "response");
      if (aiResponse != null && !aiResponse.isBlank()) {
        return aiResponse;
      }
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "AI service returned an invalid response");
    }

    // Preserve the AI engine's status code (401 invalid key, 429 rate limit,
    // 502 provider error, 503 not configured, 504 timeout) and message.
    String reason = extractAiError(responseBody);
    if (reason == null || reason.isBlank()) {
      reason = "AI service is currently unavailable";
    }
    HttpStatus status = HttpStatus.resolve(response.getStatusCode().value());
    throw new ResponseStatusException(
        status != null ? status : HttpStatus.SERVICE_UNAVAILABLE, reason);
  }

  private String extractField(String responseBody, String field) {
    if (responseBody == null || responseBody.isBlank()) {
      return null;
    }
    try {
      JsonNode root = objectMapper.readTree(responseBody);
      JsonNode value = root.get(field);
      return value != null && value.isTextual() ? value.asText() : null;
    } catch (Exception ignored) {
      return null;
    }
  }

  private String extractAiError(String responseBody) {
    if (responseBody == null || responseBody.isBlank()) {
      return null;
    }
    try {
      JsonNode root = objectMapper.readTree(responseBody);
      if (root.has("detail") && root.get("detail").isObject()) {
        JsonNode detail = root.get("detail");
        if (detail.has("error") && !detail.get("error").asText().isBlank()) {
          return detail.get("error").asText();
        }
        if (detail.has("message") && !detail.get("message").asText().isBlank()) {
          return detail.get("message").asText();
        }
      }
      if (root.has("error") && !root.get("error").asText().isBlank()) {
        return root.get("error").asText();
      }
      if (root.has("message") && !root.get("message").asText().isBlank()) {
        return root.get("message").asText();
      }
    } catch (Exception ignored) {
      // Fall back to a generic message when the body is not JSON.
    }
    return null;
  }
}
