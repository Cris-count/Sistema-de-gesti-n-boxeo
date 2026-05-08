const service = require('../services/memberService');

async function list(_req, res) {
  try {
    res.json(await service.list());
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function getById(req, res) {
  try {
    res.json(await service.getById(req.params.id));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    res.status(201).json(await service.create(req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    res.json(await service.update(req.params.id, req.body));
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function remove(req, res) {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
