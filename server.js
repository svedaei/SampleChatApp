var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');
const path = require('path');

var session = require('express-session')({
  secret: 'jkhk24h5kjh345kjh34kj51234',
  resave: false,
  saveUninitialized: true
});

app.use(session);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Configuring handlebars
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



var port = 3000;

app.set('port', port);

var server = require('http').createServer(app);

//Setup socket.io
var io = require('socket.io').listen(server);
var ios = require('socket.io-express-session');
io.use(ios(session));
var socket = require('./modules/socket');
socket(io);

var db = 'mongodb://localhost/SampleChatApp'

//Setup Routers
var index = require('./modules/routes/index');
var login = require('./modules/routes/login');
app.use('/', index);
app.use('/login', login);

mongoose.connect(db);
mongoose.Promise = global.Promise;



server.listen(port);
//
// app.listen(port, function() {
//   console.log('app listening on port ' + port);
// });
