package com.ringbox.classes.web;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ClassController {

  private final ClassService classService;

  public ClassController(ClassService classService) {
    this.classService = classService;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("service", "classes-service", "status", "ok");
  }

  @GetMapping("/classes")
  public List<ClassDto> list() {
    return classService.list();
  }

  @GetMapping("/classes/{id}")
  public ClassDto getById(@PathVariable int id) {
    return classService.getById(id);
  }

  @PostMapping("/classes")
  @ResponseStatus(HttpStatus.CREATED)
  public ClassDto create(@RequestBody ClassPayload body) {
    return classService.create(body);
  }

  @PutMapping("/classes/{id}")
  public ClassDto update(@PathVariable int id, @RequestBody ClassPayload body) {
    return classService.update(id, body);
  }

  @DeleteMapping("/classes/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void remove(@PathVariable int id) {
    classService.remove(id);
  }
}
