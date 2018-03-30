var express = require('express');
var router = express.Router();
let GridRouter = require('./grid.route');

module.exports = router;

router.use('/grid', GridRouter);