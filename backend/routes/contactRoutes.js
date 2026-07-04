const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts, updateContactStatus } = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/admin/all', protectAdmin, getAllContacts);
router.put('/admin/:id', protectAdmin, updateContactStatus);

module.exports = router;