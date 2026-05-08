package com.ringbox.auth.config;

import com.ringbox.auth.user.User;
import com.ringbox.auth.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class AdminUserInitializer implements ApplicationRunner {

  private final UserRepository users;
  private final PasswordEncoder passwordEncoder;

  @Value("${boxing.admin.email}")
  private String adminEmail;

  @Value("${boxing.admin.password}")
  private String adminPassword;

  public AdminUserInitializer(UserRepository users, PasswordEncoder passwordEncoder) {
    this.users = users;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(ApplicationArguments args) {
    String email = adminEmail.trim().toLowerCase();
    if (users.findByEmailIgnoreCase(email).isPresent()) {
      return;
    }
    User admin = new User();
    admin.setName("Administrador");
    admin.setEmail(email);
    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
    admin.setRole("ADMIN");
    users.save(admin);
  }
}
