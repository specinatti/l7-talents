const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { getAnalytics, getMonitor } = require('../controllers/analyticsController');

router.get('/analytics', auth, role('financeiro', 'admin'), getAnalytics);
router.get('/monitor', auth, role('financeiro', 'admin'), getMonitor);

module.exports = router;
