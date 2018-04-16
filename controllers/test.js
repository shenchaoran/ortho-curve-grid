var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');
var fs = Promise.promisifyAll(require('fs'));
var ChildProcess = require('./child-process.controller');

// fs.writeFileAsync(path.join(__dirname, '../matlab/mx.dat'), 'asdfasdfasdf')
//     .then(() => {;
//     })
//     .catch(console.log);


var fPath1 = path.join(__dirname, '../matlab/mx_result.csv');
fs.stat(fPath1, (err, stats) => {
        if (err) {
            console.log(err);
        }
        console.log(stats);
    })
    // .then(stats => {
    //     console.log(stats);
    // })