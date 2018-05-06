const mysql = require("mysql");
const config = require('./config.json');

module.exports = {
    IntegrationServices: mysql.createPool({
        connectionLimit : 10,
        host            : config.connections.integrationServices.host,
        user            : config.connections.integrationServices.user,
        password        : config.connections.integrationServices.password,
        database        : config.connections.integrationServices.database
    })
};

