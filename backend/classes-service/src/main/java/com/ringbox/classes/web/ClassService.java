package com.ringbox.classes.web;

import com.ringbox.classes.clazz.TrainingClass;
import com.ringbox.classes.clazz.TrainingClassRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClassService {

  private final TrainingClassRepository classes;

  public ClassService(TrainingClassRepository classes) {
    this.classes = classes;
  }

  public List<ClassDto> list() {
    return classes.findAll().stream()
        .sorted(Comparator.comparing(TrainingClass::getClassDate))
        .map(ClassService::toDto)
        .toList();
  }

  public ClassDto getById(int id) {
    return classes.findById(id).map(ClassService::toDto).orElseThrow(this::notFound);
  }

  public ClassDto create(ClassPayload p) {
    validate(p);
    TrainingClass c = new TrainingClass();
    apply(c, p);
    return toDto(classes.save(c));
  }

  public ClassDto update(int id, ClassPayload p) {
    TrainingClass c = classes.findById(id).orElseThrow(this::notFound);
    validate(p);
    apply(c, p);
    return toDto(classes.save(c));
  }

  public void remove(int id) {
    if (!classes.existsById(id)) {
      throw notFound();
    }
    classes.deleteById(id);
  }

  private void validate(ClassPayload p) {
    if (p.title() == null || p.title().isBlank()
        || p.coach() == null || p.coach().isBlank()
        || p.classDate() == null
        || p.classDate().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titulo, entrenador y fecha son obligatorios.");
    }
  }

  private static void apply(TrainingClass c, ClassPayload p) {
    c.setTitle(p.title().trim());
    c.setCoach(p.coach().trim());
    c.setClassDate(parseClassDate(p.classDate()));
    c.setCapacity(p.capacity() == null || p.capacity() < 1 ? 1 : p.capacity());
    c.setIntensity(p.intensity() == null || p.intensity().isBlank() ? "Media" : p.intensity());
  }

  private static ClassDto toDto(TrainingClass c) {
    return new ClassDto(
        c.getId(),
        c.getTitle(),
        c.getCoach(),
        c.getClassDate(),
        c.getCapacity(),
        c.getIntensity(),
        c.getCreatedAt());
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada.");
  }

  private static Instant parseClassDate(String raw) {
    String s = raw.trim();
    try {
      return Instant.parse(s);
    } catch (DateTimeParseException ignored) {
      return LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
          .atZone(ZoneId.systemDefault())
          .toInstant();
    }
  }
}
