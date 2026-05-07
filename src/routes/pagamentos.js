const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { getPacotes, criarPreferencia, webhook, getPedidos } = require('../controllers/pagamentosController');

router.get('/pacotes', getPacotes);
router.post('/preferencia', criarPreferencia); // público — qualquer um pode comprar
router.post('/webhook', webhook);              // chamado pelo Mercado Pago
router.get('/pedidos', auth, role('financeiro','admin'), getPedidos);

module.exports = router;
