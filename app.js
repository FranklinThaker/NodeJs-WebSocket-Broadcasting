const http = require('http');
const express = require('express');
const chalk = require('chalk');
const logger = require('morgan');
const cors = require('cors');
const cluster = require('cluster');
const bodyParser = require('body-parser');
const glob = require('glob');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');
// initialize the WebSocket server instance
const Websocket = require('ws');

const app = express();

const SocketModel = require('./models/sockets');
const UserModel = require('./models/users');

const dbConn = require('./connection/db.connect');

// Load environment variables.
require('dotenv').config();

dbConn.connect();

app.use(cors());
app.options('*', cors());

app.use(logger('common'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

const initRoutes = (application) => {
  // including all routes
  glob('./routes/*.js', (err, routes) => {
    if (err) {
      console.log('Error occured including routes');
      return;
    }
    routes.forEach((routePath) => {
      require(routePath).routes(application);
    });
    console.warn('No of routes file : ', routes.length);
  });
};


app.get('/', (req, res) => {
  res.send('Backend server is working fine..');
});

app.use((req, res, next) => {
  if (cluster.worker) {
    console.log('SERVER ->>>> PROCESS_ID', cluster.worker.process.pid, 'SERVER ->>>> WORKER_ID', cluster.worker.id);
  }
  next();
});


initRoutes(app);

const server = http.Server(app);

// eslint-disable-next-line import/order

const ws = new Websocket.Server({ server });

ws.on('connection', (socket) => {
  socket.id = uuid.v4();
  console.log('socket.id', socket.id);
  // send immediatly a feedback to the incoming connection
  socket.send('Hi there, I am a WebSocket server');
  socket.send(socket.id);

  socket.on('CLIENT_JOINED', async (data) => {
    console.log('TCL: data', data);
    const ifUserExist = await UserModel.findOne({
      _id: data._id,
      emailAddress: data.emailAddress,
    });

    if (ifUserExist){
      const alreadyExistData = await SocketModel.findOne({
        emailAddress: data.emailAddress.toLowerCase(),
        userId: data._id,
      });

      if (alreadyExistData){
        await SocketModel.findOneAndUpdate({
          emailAddress: data.emailAddress.toLowerCase(),
          userId: data._id,
          socketId: { $nin: socket.id },
        }, {
          adminId: null,
          emailAddress: data.emailAddress.toLowerCase(),
          role: data.role,
          $push: { socketId: socket.id },
          companyId: null,
          userId: data._id,
        });
      } else {
        const newData = new SocketModel({
          adminId: null,
          emailAddress: data.emailAddress.toLowerCase(),
          role: data.role,
          companyId: null,
          userId: data._id,
        });
        newData.socketId.push(socket.id);
        await newData.save();
      }
    }
  });

  socket.on('disconnect', async () => {
    try {
      await SocketModel.findOneAndUpdate({ socketId: { $in: socket.id } }, {
        $pull: { socketId: socket.id },
      });
    } catch (error){
      console.log('TCL: error', error);
    }
    console.log(socket.id, 'Got disconnect!');
  });
});

server.listen(process.env.APP_PORT, () => {
  console.log(chalk.blue(`Server & Socket listening on port ${process.env.APP_PORT}!`));
});

module.exports = { ws };
