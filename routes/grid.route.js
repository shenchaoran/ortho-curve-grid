let express = require('express');
let router = express.Router();
var GridCtrl = require('../controllers/grid.controller');

module.exports = router;



router.route('/mesh')
    .post((req, res, next) => {
        if (req.body.matrixX && req.body.matrixY) {
            GridCtrl.mesh(req.body.matrixX, req.body.matrixY)
                .then(rst => {
                    res.send({
                        succeed: true,
                        matrixX: rst.matrixX,
                        matrixY: rst.matrixY
                    });
                })
                .catch(err => {
                    res.send({
                        succeed: false
                    })
                });
        } else {
            res.end(0);
        }
    });