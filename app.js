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
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const RoomUsersModel = require('./models/room_users');
const RoomMessages = require('./models/room_messages');

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
  socket.send(socket.id);

  socket.on('message', async(data) => {
    const jsonData = JSON.parse(data);
    console.log('jsonData', jsonData);

    if (jsonData.event === 'SEND_MSG_TO_ROOM'){
      jsonData._id = mongoose.Types.ObjectId();
      await RoomMessages.findOneAndUpdate({ roomId: jsonData.to }, {
        roomId: jsonData.to,
        $push: { messages: jsonData },
      }, {
        upsert: true,
      });

      const roomData = await RoomUsersModel.find({ roomId: jsonData.to });
      jsonData.event = 'RECEIVE_MSG_IN_ROOM';
      ws.clients.forEach(async(client) => {
        const socketData = await SocketModel.findOne({ socketId: client.id });
        if (socketData) {
          console.log('client', client.id);

          await bluebird.each(roomData, (room) => {
            if (client.readyState === Websocket.OPEN && room.userId === socketData.userId) {
              client.send(JSON.stringify(jsonData));
            }
          });
        }
      });
    } else if (jsonData.event === 'CLIENT_JOINED') {
      const ifUserExist = await UserModel.findOne({
        emailAddress: jsonData.emailAddress,
      });

      if (ifUserExist){
        await SocketModel.findOneAndUpdate({
          emailAddress: jsonData.emailAddress.toLowerCase(),
          userId: ifUserExist._id,
        }, {
          emailAddress: jsonData.emailAddress.toLowerCase(),
          socketId: socket.id,
          userId: ifUserExist._id,
        }, {
          upsert: true,
        });
      }
    }
  });

  socket.on('close', async () => {
    try {
      await SocketModel.findOneAndUpdate({ socketId: socket.id }, {
        socketId: '',
      });
    } catch (error){
      console.log('TCL: error', error);
    }
    console.log(socket.id, 'Got disconnect!');
  });
});

/* ws.on('close', async () => {
  try {
    await SocketModel.findOneAndUpdate({ socketId: { $in: socket.id } }, {
      $pull: { socketId: socket.id },
    });
  } catch (error){
    console.log('TCL: error', error);
  }
  console.log(socket.id, 'Got disconnect!');
}); */

server.listen(process.env.APP_PORT, () => {
  console.log(chalk.blue(`Server & Socket listening on port ${process.env.APP_PORT}!`));
});

module.exports = { ws };
