const router = require('express').Router();
const { register, login, me, changePassword, requestReset, confirmReset } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.put('/senha', auth, changePassword);
router.post('/recuperar-senha', requestReset);
router.post('/redefinir-senha', confirmReset);

module.exports = router;
