//routes/index.js

module.exports = indexController;

// /routes/index.js
var express = require('express');
var router = express.Router();

var indexController = require('../controllers/indexController');

/* GET home page. */
router.get('/', indexController.getIndex);

/* POST chat completion request. */
router.post('/chat', indexController.postChat);

/* GET system settings. */
router.get('/settings', indexController.getSettings);

/* POST system settings update. */
router.post('/settings', indexController.updateSettings);

module.exports = router;