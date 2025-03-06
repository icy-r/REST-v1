const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/jwtauth');

const router = express.Router();

router.get('/me', verifyToken, userController.getMe);
router.put('/update-details', verifyToken, userController.updateDetails);
router.put('/update-password', verifyToken, userController.updatePassword);

module.exports = router;
