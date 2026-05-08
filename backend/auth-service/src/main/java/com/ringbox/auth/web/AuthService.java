package com.ringbox.auth.web;

import com.ringbox.auth.jwt.JwtService;
import com.ringbox.auth.user.User;
import com.ringbox.auth.user.UserRepository;
import com.ringbox.auth.web.dto.AuthResponse;
import com.ringbox.auth.web.dto.LoginRequest;
import com.ringbox.auth.web.dto.RegisterRequest;
import com.ringbox.auth.web.dto.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public AuthResponse register(RegisterRequest req) {
    if (req.name() == null || req.name().isBlank()
        || req.email() == null || req.email().isBlank()
        || req.password() == null || req.password().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre, email y password son obligatorios.");
    }
    String email = req.email().trim().toLowerCase();
    if (users.findByEmailIgnoreCase(email).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya esta registrado.");
    }
    User user = new User();
    user.setName(req.name().trim());
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(req.password()));
    user.setRole("ADMIN".equalsIgnoreCase(req.role()) ? "ADMIN" : "USER");
    user = users.save(user);
    return new AuthResponse(toDto(user), jwtService.createToken(user));
  }

  public AuthResponse login(LoginRequest req) {
    String email = req.email() == null ? "" : req.email().trim().toLowerCase();
    User user =
        users
            .findByEmailIgnoreCase(email)
            .filter(u -> passwordEncoder.matches(req.password() == null ? "" : req.password(), u.getPasswordHash()))
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas."));
    return new AuthResponse(toDto(user), jwtService.createToken(user));
  }

  public UserDto getProfile(long userId) {
    User user =
        users
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
    return toDto(user);
  }

  private static UserDto toDto(User u) {
    return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole());
  }
}
