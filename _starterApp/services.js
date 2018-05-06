const common = require('../common');
const connections = require("../connections");
const config = require('../config');

var exports = {};

exports.getAll = () => {
    return new Promise((resolve, reject) => {
        //Create SQL
        var sql = "SELECT * FROM Apps;";        

        //Execute
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else resolve(results);
            });
    });   
}

exports.create = (name, description) => {
    return new Promise((resolve, reject) => {
        //Validate
        if (!name) reject("A name is required.");
        else if (name.length < 3) reject("'" + name + "' is too short to be a name.");
        else if (!description) reject("A description is required.")
        else if (description.length < 10) reject("'" + description + "' is too short to be a description.");       

        //Create SQL
        var sql = "Insert INTO  Apps (name, description, updated) Values("
            sql += "'" + name + "'";
            sql += ", '" + description + "'";
            sql += ", '" + common.dates.string.mysql(new Date()) + "'";
            sql += ");";
        
        //Execute
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                if (results.insertId == 0) reject("[Object Name] could not be added at this time. Please try again later.")
                else resolve(results);
            });
    });
}

exports.update = (id, name, description) => {    
    return new Promise((resolve, reject) => {
        //Validate
        if (isNaN(id)) reject("The id is invalid.");
            
        //Create SQL        
        var sql = "UPDATE Apps SET ";

        var params = [];
        if (name)
            if (name.length > 3) params.push("name = '" + name + "'");
            else reject("'" + name + "' is too short to be a name.");
        
        if (description)
            if (description.length > 3) params.push("description = '" + description + "'");
            else reject("'" + name + "' is too short to be a description.");

        sql += params.join(', ');
        sql += " Where id = " + id + ";"

        if (params.length > 0){
            //Execute SQL
            connections.IntegrationServices.query(sql, 
                (error, results, fields) => {
                    if (error) reject(error);
                    else if (results.affectedRows == 0) reject("No match found for that Id");
                    else resolve(results);
                });
        }
        else reject("No update parameters provided.");  
    });
}

exports.delete = (id) => {
    return new Promise(function(resolve, reject){
        //Validation
        if (isNaN(id)) 
            reject("'" + id + "' is and invalid roleId");

        //Create SQL
        var sql = "DELETE FROM  Apps WHERE id = " + id + ";";

        //Execute SQL
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else if (results.affectedRows == 0) reject("No records for roleId '" + id + "' could be found.");
                else resolve(results);
            });
    });
}

module.exports = exports;
