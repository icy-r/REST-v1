const express = require('express');
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin } = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/', verifyToken, isAdmin, categoryController.createCategory);
router.get('/', verifyToken, categoryController.getAllCategories);
router.get('/:id', verifyToken, categoryController.getCategory);
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
