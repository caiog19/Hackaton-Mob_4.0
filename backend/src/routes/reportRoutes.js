const express = require('express');
const router = express.Router();
const { createReport, getAllReports } = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, createReport);

router.get('/', getAllReports);

module.exports = router;