const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const c = require('../controllers/candidatoController');

router.use(auth, role('candidato'));

router.get('/perfil', c.getPerfil);
router.put('/perfil', c.updatePerfil);

router.post('/experiencias', c.addExperiencia);
router.delete('/experiencias/:id', c.deleteExperiencia);

router.post('/formacoes', c.addFormacao);
router.delete('/formacoes/:id', c.deleteFormacao);

router.get('/candidaturas', c.getCandidaturas);

router.get('/vagas-salvas', c.getVagasSalvas);
router.post('/vagas-salvas/:vagaId', c.salvarVaga);
router.delete('/vagas-salvas/:vagaId', c.removerVagaSalva);

module.exports = router;
