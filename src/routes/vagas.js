const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { listarVagas, getVaga, candidatar } = require('../controllers/vagaController');

// Público
router.get('/', listarVagas);
router.get('/:id', getVaga);

// Candidato
router.post('/:id/candidatar', auth, role('candidato'), candidatar);

module.exports = router;
