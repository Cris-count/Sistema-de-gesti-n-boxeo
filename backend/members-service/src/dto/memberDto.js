function toMemberDto(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    plan: row.plan,
    status: row.status,
    weightKg: row.weight_kg,
    level: row.level,
    createdAt: row.created_at
  };
}

module.exports = { toMemberDto };
