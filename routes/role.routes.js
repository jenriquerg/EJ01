const express = require('express');
const authenticateToken = require('../middlewares/auth');
const { addRole, updateRole, deleteRole } = require('../controllers/roles.controller');

const Router = express.Router();

Router.post('/add', authenticateToken, addRole);
Router.put('/update', authenticateToken, updateRole);
Router.delete('/delete/:role', authenticateToken, deleteRole);

module.exports = Router;
