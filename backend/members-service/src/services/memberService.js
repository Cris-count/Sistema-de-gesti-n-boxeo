const repository = require('../repositories/memberRepository');
const { toMemberDto } = require('../dto/memberDto');

function validate(member) {
  if (!member.fullName || !member.plan || !member.level) {
    const error = new Error('Nombre, plan y nivel son obligatorios.');
    error.status = 400;
    throw error;
  }
}

async function list() {
  const members = await repository.findAll();
  return members.map(toMemberDto);
}

async function getById(id) {
  const member = await repository.findById(id);
  if (!member) {
    const error = new Error('Boxeador no encontrado.');
    error.status = 404;
    throw error;
  }
  return toMemberDto(member);
}

async function create(payload) {
  validate(payload);
  const member = await repository.create({
    fullName: payload.fullName,
    phone: payload.phone || '',
    plan: payload.plan,
    status: payload.status || 'ACTIVO',
    weightKg: payload.weightKg || null,
    level: payload.level
  });
  return toMemberDto(member);
}

async function update(id, payload) {
  await getById(id);
  validate(payload);
  const member = await repository.update(id, {
    fullName: payload.fullName,
    phone: payload.phone || '',
    plan: payload.plan,
    status: payload.status || 'ACTIVO',
    weightKg: payload.weightKg || null,
    level: payload.level
  });
  return toMemberDto(member);
}

async function remove(id) {
  const deleted = await repository.remove(id);
  if (!deleted) {
    const error = new Error('Boxeador no encontrado.');
    error.status = 404;
    throw error;
  }
}

module.exports = { list, getById, create, update, remove };
