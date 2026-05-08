const repository = require('../repositories/classRepository');
const { toClassDto } = require('../dto/classDto');

function validate(trainingClass) {
  if (!trainingClass.title || !trainingClass.coach || !trainingClass.classDate) {
    const error = new Error('Titulo, entrenador y fecha son obligatorios.');
    error.status = 400;
    throw error;
  }
}

async function list() {
  const classes = await repository.findAll();
  return classes.map(toClassDto);
}

async function getById(id) {
  const trainingClass = await repository.findById(id);
  if (!trainingClass) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }
  return toClassDto(trainingClass);
}

async function create(payload) {
  validate(payload);
  const trainingClass = await repository.create({
    title: payload.title,
    coach: payload.coach,
    classDate: payload.classDate,
    capacity: Number(payload.capacity || 1),
    intensity: payload.intensity || 'Media'
  });
  return toClassDto(trainingClass);
}

async function update(id, payload) {
  await getById(id);
  validate(payload);
  const trainingClass = await repository.update(id, {
    title: payload.title,
    coach: payload.coach,
    classDate: payload.classDate,
    capacity: Number(payload.capacity || 1),
    intensity: payload.intensity || 'Media'
  });
  return toClassDto(trainingClass);
}

async function remove(id) {
  const deleted = await repository.remove(id);
  if (!deleted) {
    const error = new Error('Clase no encontrada.');
    error.status = 404;
    throw error;
  }
}

module.exports = { list, getById, create, update, remove };
