const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const e = require('../controllers/empregadorController');

router.use(auth, role('empregador'));

router.get('/dashboard', e.getDashboard);
router.get('/perfil', e.getPerfil);
router.put('/perfil', e.updatePerfil);

router.get('/vagas', e.getMinhasVagas);
router.post('/vagas', e.criarVaga);
router.put('/vagas/:id', e.updateVaga);

router.get('/candidatos', e.getCandidatos);
router.put('/candidaturas/:id/status', e.updateStatusCandidatura);

module.exports = router;
