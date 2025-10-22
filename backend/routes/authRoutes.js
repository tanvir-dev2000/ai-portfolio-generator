const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/set-claims', authController.setUserClaims);

module.exports = router;
