// set up ======================================================================
var express = require('express');
var app = express(); 								// create our app w/ express
var port = process.env.PORT || 8080; 				// set the port
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
const fs = require('fs');
// var SSH 	= require('simple-ssh');

// check db folder and files
fs.exists('db', function (db) {
    if (!db) {
        console.log("not found db folder");

        fs.mkdir('db', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The db folder was created!");
        })

    }

    fs.exists('db/template.json', function (template) {
        if (!template)
            fs.writeFile("db/template.json", "", function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The template file was created!");
            });
    });
    fs.exists('db/metadata.json', function (metadata) {
        if (!metadata)
            fs.writeFile("db/metadata.json", "", function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The metadata file was created!");
            });
    });

});

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
