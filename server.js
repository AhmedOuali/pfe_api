var express = require('express');
// Create our app
var app = express();
var router = require('./apis/notifications')              // get an instance of the express Router

var bodyParser = require('body-parser');
const PORT = 3003;

app.use('/', function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next()
});
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req,res,next)=> {
  next()
})

app.use('/', router);

app.listen(PORT, function () {
  console.log('Express server is up on port ',PORT);
});
module.exports = app;