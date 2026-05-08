class Member {
  constructor({ id, full_name, phone, plan, status, weight_kg, level, created_at }) {
    this.id = id;
    this.fullName = full_name;
    this.phone = phone;
    this.plan = plan;
    this.status = status;
    this.weightKg = weight_kg;
    this.level = level;
    this.createdAt = created_at;
  }
}

module.exports = Member;
