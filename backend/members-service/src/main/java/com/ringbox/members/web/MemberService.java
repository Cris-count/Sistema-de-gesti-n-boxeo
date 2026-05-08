package com.ringbox.members.web;

import com.ringbox.members.member.Member;
import com.ringbox.members.member.MemberRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MemberService {

  private final MemberRepository members;

  public MemberService(MemberRepository members) {
    this.members = members;
  }

  public List<MemberDto> list() {
    return members.findAll().stream().map(MemberService::toDto).toList();
  }

  public MemberDto getById(int id) {
    return members.findById(id).map(MemberService::toDto).orElseThrow(this::notFound);
  }

  public MemberDto create(MemberPayload p) {
    validate(p);
    Member m = new Member();
    apply(m, p);
    return toDto(members.save(m));
  }

  public MemberDto update(int id, MemberPayload p) {
    Member m = members.findById(id).orElseThrow(this::notFound);
    validate(p);
    apply(m, p);
    return toDto(members.save(m));
  }

  public void remove(int id) {
    if (!members.existsById(id)) {
      throw notFound();
    }
    members.deleteById(id);
  }

  private void validate(MemberPayload p) {
    if (p.fullName() == null || p.fullName().isBlank()
        || p.plan() == null || p.plan().isBlank()
        || p.level() == null || p.level().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre, plan y nivel son obligatorios.");
    }
  }

  private static void apply(Member m, MemberPayload p) {
    m.setFullName(p.fullName().trim());
    m.setPhone(p.phone() == null ? "" : p.phone());
    m.setPlan(p.plan());
    m.setStatus(p.status() == null || p.status().isBlank() ? "ACTIVO" : p.status());
    m.setWeightKg(p.weightKg());
    m.setLevel(p.level());
  }

  private static MemberDto toDto(Member m) {
    return new MemberDto(
        m.getId(),
        m.getFullName(),
        m.getPhone(),
        m.getPlan(),
        m.getStatus(),
        m.getWeightKg(),
        m.getLevel(),
        m.getCreatedAt());
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Boxeador no encontrado.");
  }
}
