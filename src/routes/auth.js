const router = require('express').Router();
const { register, login, me, refresh, changePassword, requestReset, confirmReset, updateEmailAlternativo } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { formLimiter, loginLimiter } = require('../../rateLimiter');

router.post('/register', formLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', auth, me);
router.post('/refresh', auth, refresh);
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({ message: 'Logout realizado' });
});
router.put('/senha', auth, changePassword);
router.post('/recuperar-senha', formLimiter, requestReset);
router.post('/redefinir-senha', formLimiter, confirmReset);
router.put('/email-alternativo', auth, updateEmailAlternativo);

module.exports = router;
