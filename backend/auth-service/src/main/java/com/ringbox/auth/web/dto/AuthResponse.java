package com.ringbox.auth.web.dto;

public record AuthResponse(UserDto user, String token) {}
