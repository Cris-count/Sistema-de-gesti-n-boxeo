package com.ringbox.classes.config;

import com.ringbox.classes.clazz.TrainingClass;
import com.ringbox.classes.clazz.TrainingClassRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class ClassDataInitializer implements ApplicationRunner {

  private final TrainingClassRepository classes;

  public ClassDataInitializer(TrainingClassRepository classes) {
    this.classes = classes;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (classes.count() > 0) {
      return;
    }
    TrainingClass a = new TrainingClass();
    a.setTitle("Tecnica de saco");
    a.setCoach("Andres Vega");
    a.setClassDate(Instant.now().plus(1, ChronoUnit.DAYS));
    a.setCapacity(14);
    a.setIntensity("Media");
    classes.save(a);

    TrainingClass b = new TrainingClass();
    b.setTitle("Sparring controlado");
    b.setCoach("Camila Torres");
    b.setClassDate(Instant.now().plus(2, ChronoUnit.DAYS));
    b.setCapacity(10);
    b.setIntensity("Alta");
    classes.save(b);
  }
}
