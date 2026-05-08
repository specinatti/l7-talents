const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { getMensagens, enviarMensagem, getNotificacoes, marcarLida } = require('../controllers/mensagemController');

router.use(auth);

router.get('/candidaturas/:candidaturaId/mensagens', getMensagens);
router.post('/candidaturas/:candidaturaId/mensagens', enviarMensagem);

router.get('/notificacoes', getNotificacoes);
router.put('/notificacoes/lidas', marcarLida);
router.put('/notificacoes/:id/lida', marcarLida);

module.exports = router;
