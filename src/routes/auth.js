const router = require('express').Router();
const { register, login, me, refresh, changePassword, requestReset, confirmReset, setup2FA, verify2FA, disable2FA } = require('../controllers/authController');
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

// 2FA
router.post('/2fa/setup',   auth, setup2FA);
router.post('/2fa/verify',  auth, verify2FA);
router.post('/2fa/disable', auth, disable2FA);

module.exports = router;
