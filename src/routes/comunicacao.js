const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getMensagens, enviarMensagem, getNotificacoes, marcarLida } = require('../controllers/mensagemController');

router.use(auth);

router.get('/candidaturas/:candidaturaId/mensagens', getMensagens);
router.post('/candidaturas/:candidaturaId/mensagens', enviarMensagem);

router.get('/notificacoes', getNotificacoes);
router.put('/notificacoes/lidas', (req, res) => { req.params.id = null; marcarLida(req, res); });
router.put('/notificacoes/:id/lida', marcarLida);

module.exports = router;
