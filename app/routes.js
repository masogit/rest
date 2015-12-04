module.exports = function (app) {
    var SSH = require('simple-ssh');
    var Client = require('node-rest-client').Client;
    var client = new Client();

    // CMS REST -------------------------------------------------------------
    app.post('/rest/topology', function (req, res) {
        var server = "http://" + req.body.server;
        var args = {
            data: req.body.view, // TQL Name,
            headers: {"Content-Type": "text/plain"},
            requestConfig: {timeout: 2000},
            responseConfig: {timeout: 5000}
        };

        var req = client.post(server + "/rest/topology/", args, function (data, response) {
            res.json(data);
        });

        req.on('error', function (err) {
            console.log('request error');
        });

    });

    // AM REST -------------------------------------------------------------
    app.post('/am/rest', function (req, res) {
        var url = "http://${server}${context}${ref-link}/${collection}";
        var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
        var request;
        if (req.body.param && req.body.param['orderby'].isEmpty())
            delete req.body.param['orderby'];

        var args = {
            path: req.body,
            parameters: req.body.param,
            data: req.body.data,
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth
            }
        };

        if (req.body.method == "get") {
            request = client.get(url, args, function (data, response) {
                res.send(data);
            });
        } else if (req.body.method == "post") {
            request = client.post(url, args, function (data, response) {
                res.json(data);
            });
        } else if (req.body.method == "put") {
            request = client.put(url, args, function (data, response) {
                res.json(data);
            });
        } else if (req.body.method == "delete") {
            request = client.delete(url, args, function (data, response) {
                res.json(data);
            });
        }

        request.on('error', function (err) {
            console.log('request error: ' + err);
        });
    });

    // SSH CMD -------------------------------------------------------------
    app.post('/ssh/exec', function (req, res) {
        console.log("req.body.cmd: " + req.body.cmd);
        var ssh = new SSH({
            host: req.body.host,
            user: req.body.user,
            pass: req.body.pass
        });

        ssh.exec(req.body.cmd, {
            out: function (stdout) {
                console.log("stdout: " + stdout);
                res.send(stdout);
            },

            err: function (stderr) {
                res.send(stderr);
                console.log("stderr: " + stderr);
            }
        }).start();
    });

    // load the single view file
    app.get('/ssh', function (req, res) {
        res.sendfile('./public/ssh.html');
    });

    app.get('/cms', function (req, res) {
        res.sendfile('./public/cms.html');
    });

    app.get('/am', function (req, res) {
        res.sendfile('./public/am.html');
    });

    app.get('/', function (req, res) {
        res.sendfile('./public/index.html');
    });

};


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};