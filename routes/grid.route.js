let express = require('express');
let router = express.Router();

module.exports = router;

router.route('')
    .get((req, res, next) => {
        return res.end();
    });