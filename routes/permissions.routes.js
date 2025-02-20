const express = require('express');
const authenticateToken = require('../middlewares/auth');
const { addPermission, deletePermission } = require('../controllers/permissions.controller');

const router = express.Router();

router.post('/add/:role', authenticateToken, addPermission);
router.post('/delete/:role', authenticateToken, deletePermission);

module.exports = router;