const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/users', protect, userController.getAll);
router.get('/users/:id', protect, userController.getOne);
router.put('/users/:id', protect, userController.update);
router.delete('/users/:id', protect, userController.remove);

module.exports = router;
