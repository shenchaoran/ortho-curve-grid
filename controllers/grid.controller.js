var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');
var fs = Promise.promisifyAll(require('fs'));
var ChildProcess = require('./child-process.controller');
var child_process = require('child_process');


var GridCtrl = {};
module.exports = GridCtrl;

GridCtrl.mesh = (matrixX, matrixY) => {
    var strX = '';
    var strY = '';
    _.map(matrixX, row => {
        strX += _.join(row, ' ');
        strX += '\r\n';
    });

    _.map(matrixY, row => {
        strY += _.join(row, '\t');
        strY += '\n';
    });

    return new Promise((resolve, reject) => {
        Promise.all([
                fs.writeFileAsync(path.join(__dirname, '../matlab/mx.csv'), strX),
                fs.writeFileAsync(path.join(__dirname, '../matlab/my.csv'), strY)
            ])
            .then(rsts => {
                var exePath = path.join('ortho_curve_grid_main');
                var cmd = 'matlab -nosplash -nodesktop -r ' + exePath;
                child_process.exec(cmd, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err);
                        return reject(err)
                    }
                    if (stderr) {
                        console.log(stderr);
                    }
                });
                ChildProcess.newScanProcess()
                    .then(hasFinished => {
                        console.log(hasFinished);
                        if (!hasFinished) {
                            return reject();
                        } else {
                            return Promise.all([
                                    fs.readFileAsync(path.join(__dirname, '../matlab/mx_result.csv'), 'utf8'),
                                    fs.readFileAsync(path.join(__dirname, '../matlab/my_result.csv'), 'utf8')
                                ])
                                .then(rsts => {
                                    return Promise.resolve({
                                        matrixX: rsts[0],
                                        matrixY: rsts[1]
                                    });
                                });
                        }
                    })
                    .then(rst => {
                        // 删除结果文件
                        Promise.all([
                                fs.unlinkAsync(path.join(__dirname, '../matlab/mx_result.csv')),
                                fs.unlinkAsync(path.join(__dirname, '../matlab/my_result.csv')),
                            ])
                            .then(rsts => {
                                return resolve(rst);
                            })
                            .catch(err => {
                                return reject(err);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                        return reject(err);
                    });
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
    })
}