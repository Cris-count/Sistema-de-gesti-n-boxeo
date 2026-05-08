package com.ringbox.auth.web;

import com.ringbox.auth.web.dto.AuthResponse;
import com.ringbox.auth.web.dto.LoginRequest;
import com.ringbox.auth.web.dto.RegisterRequest;
import com.ringbox.auth.web.dto.UserDto;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("service", "auth-service", "status", "ok");
  }

  @PostMapping("/auth/register")
  public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest body) {
    return ResponseEntity.status(201).body(authService.register(body));
  }

  @PostMapping("/auth/login")
  public AuthResponse login(@RequestBody LoginRequest body) {
    return authService.login(body);
  }

  @GetMapping("/auth/me")
  public UserDto me(Authentication authentication) {
    long id = Long.parseLong(authentication.getName());
    return authService.getProfile(id);
  }
}
