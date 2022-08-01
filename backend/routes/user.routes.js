const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller')

/*
// Liste les routes des sauces. 
*/

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;