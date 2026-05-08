const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { getDashboard, enviarComunicado } = require('../controllers/rhController');

router.get('/dashboard', auth, role('rh', 'admin'), getDashboard);
router.post('/comunicado', auth, role('rh', 'admin'), enviarComunicado);

module.exports = router;
