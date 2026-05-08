package com.ringbox.classes.web;

public record ClassPayload(
    String title, String coach, String classDate, Integer capacity, String intensity) {}
