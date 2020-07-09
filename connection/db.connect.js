const mongoose = require('mongoose');

exports.connect = async () => {
  // Configuring the database
  mongoose.Promise = global.Promise;
  // mongoose.set('debug', true);
  // Connecting to the database
  await mongoose.connect(`${process.env.DB_DIALECT}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    auth: {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }).then(() => {
    console.log('Successfully connected to the database');
  }).catch((err) => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
  });
};

exports.removeDB = async () => {
  const mongodbconnection = require('mongoose');
  mongodbconnection.connect(`${process.env.DB_DIALECT}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
    auth: {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  const { connection } = mongodbconnection;
  connection.once('open', () => {
    console.log('*** MongoDB got connected ***');
    console.log(`Our Current Database Name : ${connection.db.databaseName}`);
    mongodbconnection.connection.db.dropDatabase(
      console.log(`${connection.db.databaseName} database dropped.`),
    );
  });
};
