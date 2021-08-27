var express = require('express');
var router = express.Router();

var fileRouter = require('./file');

router.use('/', fileRouter);

router.get('/hello', function (req, res, next) {
    res.send('hello, world!')
})

module.exports = router;