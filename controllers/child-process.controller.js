var child_process = require('child_process');
var Promise = require('bluebird');
var path = require('path');
var http = require('http');

var ChildProcess = {};
module.exports = ChildProcess;

ChildProcess.getPort = () => {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(0);
        server.on('listening', () => {
            const port = server.address().port;
            server.close();
            resolve(port);
        });
    });
};

ChildProcess.newMeshProcess = () => {
    ChildProcess.getPort()
        .then(port => {
            var cpPath = path.join(__dirname, '../matlab/main.m');
            child_process.exec('matlab -nosplash -nodesktop -r main', (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                }
                if (stderr) {
                    console.log(stderr);
                }
                console.log(stdout);

            });

        })
        .catch(error => {
            console.log(error);
        })
}

// 根据输出文件，扫描matlab程序是否运行结束
ChildProcess.newScanProcess = () => {
    return new Promise((resolve, reject) => {
        ChildProcess.getPort()
            .then(port => {
                var cpPath = path.join(__dirname, 'scan.controller.js');
                var cp = child_process.fork(cpPath, [], {
                    execArgv: ['--inspect=' + port]
                });
                cp.send({
                    code: 'scan'
                });
                cp.on('message', m => {
                    if (m.code === 'state') {
                        cp.kill();
                        return resolve(m.hasFinished);
                    }
                });
            })
            .catch(err => {
                return reject(err);
            });
    })
}