const express = require('express');
const authenticateToken = require('../middlewares/auth');
const { getUsers } = require('../controllers/users.controller');

const router = express.Router();

router.get('/get', authenticateToken, getUsers);

module.exports = router;
