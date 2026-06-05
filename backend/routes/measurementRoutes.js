const express = require('express');
const router = express.Router();
const { addMeasurement, getMeasurementHistory } = require('../controllers/measurementController');

const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, addMeasurement);
router.get('/', authMiddleware, getMeasurementHistory);

module.exports = router;