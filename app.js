const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const config = require('./config.json');

//Set app variables
const app = express();
const port = config.port;

//Enable http body reader
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Set content directory
app.use(express.static(path.join(__dirname, 'public')));

//Handle Errors
app.use((error, req, res, next) => {
    var msg = (error.message) ? error.message : error;
    res.status(400).json({"status": "error", "message": msg });
});

//Start App on port
app.listen(port, ()=>  {
    console.log("starting the server at port " + port);
});

