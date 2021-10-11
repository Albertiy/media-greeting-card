var express = require('express');
var router = express.Router();

var fileRouter = require('./file');
var codeRouter = require('./code');
var artRouter = require('./art');

router.use('/', fileRouter);
router.use('/', codeRouter);
router.use('/', artRouter);

router.get('/hello', function (req, res, next) {
    res.send('hello, world!')
})

module.exports = router;