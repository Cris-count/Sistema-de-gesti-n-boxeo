class TrainingClass {
  constructor({ id, title, coach, class_date, capacity, intensity, created_at }) {
    this.id = id;
    this.title = title;
    this.coach = coach;
    this.classDate = class_date;
    this.capacity = capacity;
    this.intensity = intensity;
    this.createdAt = created_at;
  }
}

module.exports = TrainingClass;
