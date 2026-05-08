package com.ringbox.auth.web.dto;

public record RegisterRequest(String name, String email, String password, String role) {}
