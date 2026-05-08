class User {
  constructor({ id, name, email, role, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = created_at;
  }
}

module.exports = User;
