package com.ringbox.members.web;

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
public class MemberController {

  private final MemberService memberService;

  public MemberController(MemberService memberService) {
    this.memberService = memberService;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("service", "members-service", "status", "ok");
  }

  @GetMapping("/members")
  public List<MemberDto> list() {
    return memberService.list();
  }

  @GetMapping("/members/{id}")
  public MemberDto getById(@PathVariable int id) {
    return memberService.getById(id);
  }

  @PostMapping("/members")
  @ResponseStatus(HttpStatus.CREATED)
  public MemberDto create(@RequestBody MemberPayload body) {
    return memberService.create(body);
  }

  @PutMapping("/members/{id}")
  public MemberDto update(@PathVariable int id, @RequestBody MemberPayload body) {
    return memberService.update(id, body);
  }

  @DeleteMapping("/members/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void remove(@PathVariable int id) {
    memberService.remove(id);
  }
}
