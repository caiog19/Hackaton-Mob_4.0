const { Report, User } = require('../models');

async function createReport(req, res) {
  try {
    const { type, description, location, busLine } = req.body;
    const user = req.user; 

    if (!type || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Tipo e localização (lat/lng) são obrigatórios.' });
    }

    const report = await Report.create({
      type,
      description,
      latitude: location.latitude,
      longitude: location.longitude,
      busLine: busLine,
      userId: user.id,
      userName: user.name,
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Erro ao criar relato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getAllReports(req, res) {
  try {
    const reports = await Report.findAll({
      order: [['createdAt', 'DESC']], 
      include: { 
        model: User,
        as: 'user',
        attributes: ['id', 'name'] 
      }
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Erro ao buscar relatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { createReport, getAllReports };