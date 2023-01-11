const router = require('express').Router();
const authController = require('../controllers/authControllers');

router.post('/signup',authController.signupController);
router.post('/login',authController.loginController);
router.get('/refresh',authController.refreshAccessTokenController);
router.post('/logut',authController.logoutController);

module.exports = router;