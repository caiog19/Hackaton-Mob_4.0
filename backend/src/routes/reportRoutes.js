const express = require('express');
const router = express.Router();
const { createReport, getAllReports } = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/', authMiddleware, upload.single('photo'), createReport);
router.get('/', getAllReports);

module.exports = router;