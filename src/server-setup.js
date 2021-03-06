"use strict";

const express = require('express');
const winston = require('winston');
const logger = require('morgan');
const bodyParser = require('body-parser');
const RapidoError = require('./errors/rapido-error.js');
const RapidoErrorCodes = require('./errors/codes.js');
const cors = require('cors');

const users = require('./handlers/users.js');
const projects = require('./handlers/projects.js');
const sketches = require('./handlers/sketches.js');
const echo = require('./handlers/echo.js');
const authentication = require('./security/authentication.js');
const middleware = require('./handlers/middleware.js');
const nodes = require('./handlers/nodes.js');


//TODO: Rename this to routesetup or something more meaningful

const start = function start(serverPort, cb) {

  // Setup the express server
  const app = express();
  //app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
  //server.use(express.static(path.join(__dirname, 'public')));

  winston.log('info', 'server is listening on port: ' + serverPort);


  app.use(middleware.requestValidator);

  winston.log('debug', 'setting up routes...');
  // Setup routes
  app.all('/api/echo', echo.echoHandler);
  app.post('/api/register', users.registrationHandler);
  app.post('/api/login', users.loginHandler);
  app.post('/api/projects', authentication.authenticateRequest, projects.createProjectHandler);
  app.get('/api/projects', authentication.authenticateRequest, projects.findProjectsHandler);
  app.get('/api/projects/:projectId', authentication.authenticateRequest, projects.findProjectHandler);
  app.post('/api/projects/:projectId/sketches', authentication.authenticateRequest, sketches.createSketchHandler);
  app.post('/api/sketches/:sketchId/nodes', authentication.authenticateRequest, nodes.createRootNodeHandler);
  app.post('/api/sketches/:sketchId/nodes/:nodeId', authentication.authenticateRequest, nodes.createChildNodeHandler);
  app.patch('/api/sketches/:sketchId/nodes/:nodeId', authentication.authenticateRequest, nodes.updateNodePropertiesHandler);

  winston.log('debug', 'finished setting up routes');
  winston.log('debug', serverPort);

  // Setup error handlers
  app.use(function (err, req, res, next) {
    winston.log('error', err.stack);
    if( err.name === 'RapidoError') {
      res.status(err.status).send(err.message);
    }else if( err.name === 'SyntaxError') {
      res.status(400).send('Malformed request body');
    }else {
      res.status(500).send('Something broke!')
    }
  })

  winston.log()

  // Start the server
  const server = app.listen(serverPort, () => {
    //winston.log('debug', '%s listening at %s', app.name, app.url);
    // Return the server to a callback function if one has been specified
    // TODO: turn this into a Promise
    if (cb) {
      cb(server, app);
    }
  });


};

module.exports = {
  start
};
