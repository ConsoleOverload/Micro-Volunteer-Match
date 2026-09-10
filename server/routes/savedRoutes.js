const express = require('express');
const router = express.Router();
const { getSavedTasks } = require('../controllers/savedController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSavedTasks);

module.exports = router;
