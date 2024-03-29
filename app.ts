'use strict';

import express from 'express';
import mongoose from 'mongoose';

import expressConfig from './frameworks/webserver/express';
import serverConfig from './frameworks/webserver/server';
import routes from './frameworks/webserver/routes';

const app = express();
const server = require('http').createServer(app);

// express.js configuration (middlewares,...)
expressConfig(app);

// server configuration and start (using Terminus for health check)
serverConfig(app, mongoose, server).startServer();

// Connect database
import './frameworks/database/mongodb/connection';

// Init routes
routes(app, express);

// Handle error middleware
import {
   is404Handler,
   returnError,
} from './frameworks/webserver/middlewares/errorHandler.middleware';
app.use(is404Handler);
app.use(returnError);

export default app;
