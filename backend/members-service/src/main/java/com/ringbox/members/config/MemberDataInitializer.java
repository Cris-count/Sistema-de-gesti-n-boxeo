package com.ringbox.members.config;

import com.ringbox.members.member.Member;
import com.ringbox.members.member.MemberRepository;
import java.math.BigDecimal;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class MemberDataInitializer implements ApplicationRunner {

  private final MemberRepository members;

  public MemberDataInitializer(MemberRepository members) {
    this.members = members;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (members.count() > 0) {
      return;
    }
    Member a = new Member();
    a.setFullName("Laura Martinez");
    a.setPhone("3001234567");
    a.setPlan("Mensual");
    a.setStatus("ACTIVO");
    a.setWeightKg(new BigDecimal("61.5"));
    a.setLevel("Intermedio");
    members.save(a);

    Member b = new Member();
    b.setFullName("Carlos Rios");
    b.setPhone("3015559090");
    b.setPlan("Trimestral");
    b.setStatus("ACTIVO");
    b.setWeightKg(new BigDecimal("78"));
    b.setLevel("Avanzado");
    members.save(b);
  }
}
