var express = require('express');
// Create our app
var app = express();
var router = require('./api/notifications')              // get an instance of the express Router
var webPush = require('web-push');

var bodyParser = require('body-parser');


app.use('/', function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next()
});
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req,res,next)=> {
  console.log(req.method, req.url)
  next()
})

app.use('/', router);
module.exports = app;