const express = require('express');
const goalController = require('../controllers/goalController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin, isResourceOwner } = require('../middleware/authmiddleware');
const Goal = require('../models/Goal');

const router = express.Router();

router.post('/', verifyToken, goalController.createGoal);
router.get('/', verifyToken, goalController.getUserGoals);
router.get('/:id', verifyToken, isResourceOwner(Goal), goalController.getGoal);
router.put('/:id', verifyToken, isResourceOwner(Goal), goalController.updateGoal);
router.put('/:id/contribute', verifyToken, isResourceOwner(Goal), goalController.contributeToGoal);
router.delete('/:id', verifyToken, isResourceOwner(Goal), goalController.deleteGoal);

module.exports = router;
