package com.ringbox.auth.jwt;

import com.ringbox.auth.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey key;
  private static final long TTL_MS = 8 * 60 * 60 * 1000L;

  public JwtService(@Value("${boxing.jwt.secret}") String secret) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String createToken(User user) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("email", user.getEmail())
        .claim("role", user.getRole())
        .claim("name", user.getName())
        .issuedAt(new Date(now))
        .expiration(new Date(now + TTL_MS))
        .signWith(key)
        .compact();
  }

  public Claims parseAndValidate(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
