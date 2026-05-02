const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/analytics', auth, role('financeiro', 'admin'), getAnalytics);

module.exports = router;
