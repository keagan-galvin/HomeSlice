const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 

//Internal Imports
const config = require('./config.json');
const api = require('./components/api');

//Set app variables
const app = express();
const port = config.port;

//Enable http body reader
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Set content directory
app.use(express.static(path.join(__dirname, 'public')));

//Handle Errors
app.use((error, req, res, next) => {
    var msg = (error.message) ? error.message : error;
    res.status(400).json({
        "status": "error",
        "message": msg
    });
});

//Connect to DB
mongoose.connection.on('connected', function () {
    console.log('Mongoose connection opened');
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

mongoose.connect("mongodb://" + config.connections.homeSlice.user + ":" + config.connections.homeSlice.password + "@" + config.connections.homeSlice.host + "/" + config.connections.homeSlice.database)

//Set Routing
app.use('/api', api);

//Start App on port
app.listen(port, () => {
    console.log("starting the server at port " + port);
});