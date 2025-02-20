const express = require('express');
const authenticateToken = require('../middlewares/auth');
const { getUsers, updateUser, deleteUser } = require('../controllers/users.controller');

const router = express.Router();

router.get('/get', authenticateToken, getUsers);
router.put('/update/:username', authenticateToken, updateUser);
router.delete('/delete/:username', authenticateToken, deleteUser);

module.exports = router;
