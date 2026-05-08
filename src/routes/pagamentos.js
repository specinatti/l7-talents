const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { getPacotes, criarPreferencia, processar, webhook, getPedidos } = require('../controllers/pagamentosController');

router.get('/pacotes', getPacotes);
router.post('/preferencia', criarPreferencia);
router.post('/processar', processar);
router.post('/webhook', webhook);
router.get('/pedidos', auth, role('financeiro','admin'), getPedidos);

module.exports = router;
