const express = require('express');
const router = express.Router();
const auth = require('../api/auth');
const multer = require('../api/multer-config');
const sauceCtrl = require('../controllers/sauce.controller');

router.get('/', sauceCtrl.getAllSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.post('/', multer, sauceCtrl.createSauce);
//router.put('/:id', multer, sauceCtrl.updateSauce);
router.delete('/:id', sauceCtrl.deleteSauce);
//router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;