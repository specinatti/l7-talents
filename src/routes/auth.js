const router = require('express').Router();
const { register, login, me, refresh, changePassword, requestReset, confirmReset } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { formLimiter } = require('../../rateLimiter');

router.post('/register', formLimiter, register);
router.post('/login', formLimiter, login);
router.get('/me', auth, me);
router.post('/refresh', auth, refresh);
router.put('/senha', auth, changePassword);
router.post('/recuperar-senha', formLimiter, requestReset);
router.post('/redefinir-senha', formLimiter, confirmReset);

module.exports = router;
