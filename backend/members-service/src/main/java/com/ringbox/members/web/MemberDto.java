package com.ringbox.members.web;

import java.math.BigDecimal;
import java.time.Instant;

public record MemberDto(
    Integer id,
    String fullName,
    String phone,
    String plan,
    String status,
    BigDecimal weightKg,
    String level,
    Instant createdAt) {}
