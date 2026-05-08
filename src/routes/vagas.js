const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { listarVagas, getVaga, candidatar, vagasRecomendadas } = require('../controllers/vagaController');

router.get('/', listarVagas);
router.get('/recomendadas', auth, role('candidato'), vagasRecomendadas);
router.get('/:id', getVaga);
router.post('/:id/candidatar', auth, role('candidato'), candidatar);

module.exports = router;
