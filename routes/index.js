module.exports = indexController;

// /routes/index.js
var express = require('express');
var router = express.Router();

var indexController = require('../controllers/indexController');

/* GET home page. */
router.get('/', indexController.getIndex);

/* POST chat completion request. */
router.post('/chat', indexController.postChat);

module.exports = router;