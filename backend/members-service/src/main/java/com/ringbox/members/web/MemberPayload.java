package com.ringbox.members.web;

import java.math.BigDecimal;

public record MemberPayload(
    String fullName,
    String phone,
    String plan,
    String status,
    BigDecimal weightKg,
    String level) {}
