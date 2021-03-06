"use strict";

const winston = require('winston');
winston.level = 'debug';

const config = require('./config.js');
winston.log('debug', 'loading configuration from rapido.json');
config.load('../rapido.json');

const serverManager = require('./server-setup.js');
const dataAccessor = require('../src/db/DataAccessor.js');

winston.log('debug', 'connecting to databse');
dataAccessor.start(config.database)

winston.log('debug', 'starting server...');
serverManager.start(config.port);
