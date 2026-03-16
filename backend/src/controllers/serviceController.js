const { Service } = require('../models');

const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({ where: { business_id: req.user.business_id }, order: [['name', 'ASC']] });
    return res.status(200).json(services);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const createService = async (req, res) => {
  try {
    const { name, duration_minutes, price } = req.body;
    if (!name) return res.status(400).json({ message: 'Service name is required.' });
    const service = await Service.create({ business_id: req.user.business_id, name, duration_minutes: duration_minutes || 30, price: price || 0 });
    return res.status(201).json(service);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (service.business_id !== req.user.business_id) return res.status(403).json({ message: 'Access denied.' });
    await service.update(req.body);
    return res.status(200).json(service);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (service.business_id !== req.user.business_id) return res.status(403).json({ message: 'Access denied.' });
    await service.destroy();
    return res.status(200).json({ message: 'Service deleted.' });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

module.exports = { getAllServices, createService, updateService, deleteService };
