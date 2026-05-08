function toClassDto(row) {
  return {
    id: row.id,
    title: row.title,
    coach: row.coach,
    classDate: row.class_date,
    capacity: row.capacity,
    intensity: row.intensity,
    createdAt: row.created_at
  };
}

module.exports = { toClassDto };
