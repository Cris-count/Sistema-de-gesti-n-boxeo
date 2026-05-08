package com.ringbox.classes.web;

import java.time.Instant;

public record ClassDto(
    Integer id,
    String title,
    String coach,
    Instant classDate,
    Integer capacity,
    String intensity,
    Instant createdAt) {}
