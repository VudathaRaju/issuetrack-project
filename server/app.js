var express = require('express');
var debug = require('debug')('batch2:server');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
const webpush = require('web-push');

var app = express();

var indexRouter = require('./routes/index');
var config = require('./config');

const vapidKeys =
{
  "publicKey": "BEf-TmieLZZ23RTDIE2ALphXd3vvHlbjaQrCNx01UIVcZJ99M2vAMU0BC4eivlM2Vb_3NqDi2Ge2n_s4cHQM1Go",
  "privateKey": "nELsMjvh5vAdPWjNzUzoBUxqv8XxiVg-es62JI_FFBo"
}

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

mongoose.connect(config.database, {
  useNewUrlParser: true
}, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Connected to Database...');
}); // Connect to database


app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/issues', express.static(path.join(__dirname, 'issues')));

app.all('/*', function (req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, X-Access-Token, X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
app.all('/api/v1/*', [require('./middleware/validateRequest')]);


app.use('/api', indexRouter);

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

// error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      status: err.status || 500,
      message: err.message
    })
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message
  })
});


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3013');
app.set('port', port);
/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('socket.io')(server);

server.listen(port, function () {
  console.log(`Express server running on *: ${port}`);
});
server.on('client error', onError);
server.on('client listening', onListening);


io.on('connection', (socket) => {
  console.log('socket connection established');
  // global.ssocket=ssocket;
  socket.on('getdata', function (data) {
    console.log(data);
    socket.broadcast.emit('throwDataToAngular', data);
  })
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}