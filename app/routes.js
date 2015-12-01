module.exports = function (app) {
    var SSH = require('simple-ssh');
    var Client = require('node-rest-client').Client;
    var client = new Client();

    // application -------------------------------------------------------------
    app.post('/rest/topology', function (req, res) {
        var server = "http://" + req.body.server;
        var args = {
            data: req.body.view, //"queryNodes",
            headers: {"Content-Type": "text/plain"},
            requestConfig: {timeout: 2000},
            responseConfig: {timeout: 5000}
        };

        var req = client.post(server + "/rest/topology/", args, function (data, response) {
            res.json(data);
        });

        //req.on('requestTimeout', function (req) {
        //    console.log(server + "/rest/topology/" + 'request has expired');
        //    req.abort();
        //});
        //
        //req.on('responseTimeout', function (res) {
        //    console.log('response has expired');
        //    res.abort();
        //});
        //
        //req.on('error', function (err) {
        //    console.log('request error');
        //});

    });

    app.post('/am/get', function (req, res) {
//        var url = "http://" + req.body.server + req.body.context + req.body.table;
        var url = "http://${server}${context}${ref-link}/${collection}";
        var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');

        if (req.body.param && req.body.param['orderby'].isEmpty())
            delete req.body.param['orderby'];

        var args = {
            path: req.body,
            parameters: req.body.param,
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth
            }
        };


        var req = client.get(url, args, function (data, response) {
            console.log("get data: " + data);
            try {
                JSON.parse(data);
                res.json(data);
            } catch (e) {
                res.send(data);
            }
        });
        console.log("req.options: " + JSON.stringify(req.options));


        req.on('error', function (err) {
            console.log('request error: ' + err);
        });
    });

    app.post('/am/post', function (req, res) {
//        var url = "http://" + req.body.server + req.body.context + req.body.table;
        var url = "http://${server}${context}${ref-link}";
        var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
        console.log("req.body.data: " + JSON.stringify(req.body.data));
        var args = {
            path: req.body,
            data: req.body.data,
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth
            }
        };

        var req = client.post(url, args, function (data, response) {
            console.log("post data: " + data);
            res.json(data);
        });
        console.log("req.options: " + JSON.stringify(req.options));


        req.on('error', function (err) {
            console.log('request error: ' + err);
        });
    });

    app.post('/am/put', function (req, res) {
//        var url = "http://" + req.body.server + req.body.context + req.body.table;
        var url = "http://${server}${context}${ref-link}";
        var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
        console.log("req.body.data: " + JSON.stringify(req.body.data));
        var args = {
            path: req.body,
            data: req.body.data,
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth
            }
        };


        var req = client.put(url, args, function (data, response) {
            console.log("put data: " + data);
            res.json(data);
        });
        console.log("req.options: " + JSON.stringify(req.options));


        req.on('error', function (err) {
            console.log('request error: ' + err);
        });
    });

    app.post('/am/delete', function (req, res) {
//        var url = "http://" + req.body.server + req.body.context + req.body.table;
        var url = "http://${server}${context}${ref-link}";
        var auth = 'Basic ' + new Buffer(req.body.user + ':' + req.body.password).toString('base64');
        var args = {
            path: req.body,
            headers: {
                "Content-Type": "application/json",
                "Authorization": auth
            }
        };


        var req = client.delete(url, args, function (data, response) {
            console.log("put data: " + data);
            res.json(data);
        });
        console.log("req.options: " + JSON.stringify(req.options));


        req.on('error', function (err) {
            console.log('request error: ' + err);
        });
    });
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
                console.log("stderr: " + stderr); // this-does-not-exist: command not found
            }
        }).start();
    });

    app.get('/ssh', function (req, res) {
        res.sendfile('./public/ssh.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    app.get('/cms', function (req, res) {
        res.sendfile('./public/cms.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    app.get('/am', function (req, res) {
        res.sendfile('./public/am.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    app.get('/', function (req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

};


String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};