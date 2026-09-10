const express = require('express');
const router = express.Router();
const { getMatches, getTaskMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMatches);
router.get('/:taskId', protect, getTaskMatch);

module.exports = router;
