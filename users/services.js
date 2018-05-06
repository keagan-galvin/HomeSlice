const common = require('../common');
const config = require('../config');
const connections = require("../connections");
const auth = require('../auth/services').auth;

var exports = {
        access: {}
};

exports.findByEmail = (email) => {
    return new Promise(function(resolve, reject){
        if (!common.validation.email(email))
            reject("'" + email + "' is an invalid email.");
        else {
            const sql = "SELECT * FROM Users WHERE email = '" + email + "'";
            connections.IntegrationServices.query(sql, function (error, results, fields) {
                if (error) return reject(error);
                else resolve(results);
            });
        }
    });      
}

exports.findById = (id) => {
    return new Promise(function(resolve, reject){
        if (isNaN(id)) 
            reject("'" + id + "' is an invalid id.");
        else {
            const sql = "SELECT * FROM Users WHERE id = '" + id + "'";
            connections.IntegrationServices.query(sql, function (error, results, fields) {
                if (error) reject(error);
                else resolve(results);
            });
        }  
    });    
}

exports.create = (email, password) => {
    return new Promise(function(resolve, reject){
        
        //Validate Params;
        if (!common.validation.email(email)) 
            reject("'" + email + "' is an email.");

        //Hash Password;
        var hashedPassword = auth.hashPassword(password);

        //Create Insert SQL;
        var sql = "INSERT INTO Users (email, hash, salt, created, updated) "
                + "Values ("
                    + "'" + email + "'"
                    + ",'" + hashedPassword.hash + "'"
                    + ",'"+ hashedPassword.salt + "'"
                    + ",'" + common.dates.string.mysql(new Date()) + "'"
                    + ",'" + common.dates.string.mysql(new Date()) + "'"
                + ");"
        
        //Insert New User
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else if (results.insertId == 0) 
                    reject("User could not be created. Please try again later.");
                else resolve(results);
            });
    });
}

exports.update = (id, email, password) => {
    return new Promise(function(resolve, reject){

        //Validate
        if (isNaN(id)) reject("The id is invalid.");
        
        //Create SQL        
        var sql = "UPDATE Users SET "

        var params = [];
        if (common.validation.email(email)) params.push("email = '" + email + "'");
        if (password) {
            var hashedPassword = auth.hashPassword(password);
            params.push("hash = '" + hashedPassword.hash + "'");
            params.push("salt = '"+ hashedPassword.salt + "'");
        }

        sql += params.join(', ');
        sql += " Where id = " + id + ";"

        if (params.length > 0){
            //Execute SQL
            connections.IntegrationServices.query(sql, 
                (error, results, fields) => {
                    if (error) reject(error);
                    else if (results.affectedRows == 0) reject("No match found for that userId");
                    else resolve(results);
                });
        }
        else reject("No update parameters provided.");        
    });
}

exports.delete = (id) => {
    return new Promise(function(resolve, reject){
        //Validate
        if (isNaN(id))
            reject("The id is invalid.");
        
        //Archive User
        var sql = "INSERT INTO Users_Deleted Select * from Users Where id = " + id + ";";

        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else if (results.affectedRows == 0) reject("No match found for that userId");
                    else {
                        //DELETE User;
                        sql = "Delete FROM Users Where id = " + id + "; " 

                        connections.IntegrationServices.query(sql, 
                            (error, results, fields) => {
                                if (error) reject(error);
                                else if (results.affectedRows == 0) reject("No match found for that userId");
                                else resolve(results);
                            }); 
                    }
                });
    });
}

//USER ACCESS
exports.access.validate = (assignments) => {
    return new Promise ((resolve,reject) => {
        //Validation
        if (!assignments)
            reject("At least one access assignment must be defined.");
        else if (assignments.length == 0) 
            reject("At least one access assignment must be defined.");

        assignments.forEach((assignment) => {
            if (isNaN(assignment.appId) || assignment.appId == 0){
                reject("'" + assignment.appId + "' is an invalid appId in object: '" + JSON.stringify(assignment) + "'.");
            }
            else if (isNaN(assignment.roleId) || assignment.roleId == 0) {
                reject("'" + assignment.roleId + "' is an invalid roleId in object: '" + JSON.stringify(assignment) + "'.");
            }
            else if (isNaN(assignment.clientId)) {
                reject("'" + assignment.clientId + "' is an invalid clientId in object: '" + JSON.stringify(assignment) + "'.");
            }
            else if (isNaN(assignment.brandId)) {
                reject("'" + assignment.brandId + "' is an invalid brandId in object: '" + JSON.stringify(assignment) + "'.");
            }
        });

        resolve();    
    });
}

exports.access.getAll = (userId) => {
    return new Promise ((resolve,reject) => {
        
        //Validate Request
        if (isNaN(userId)) reject("'" + userId + "' is an invalid userId.");

        //Create SQL
        var sql = "SELECT UA.id, UA.userId, UA.appId, UA.brandId, UA.clientId, A.name as appName,";
        sql += " A.description as appDescription, UA.roleId, UR.name as roleName,";
        sql += " UR.description as roleDescription, UA.created ";
        sql += " FROM UserAccess UA";
        sql += " JOIN Apps A on A.id = UA.appId";
        sql += " JOIN UserRoles UR on UR.id = UA.roleId";
        sql += " Where userId = " + userId + ";";        

        //Execute
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else resolve(results);
            });
    });
}

exports.access.create = (userId, assignments) => {
    return new Promise(function(resolve, reject){
        //Validate
        exports.access.validate(assignments);

        //Create SQL
        var sqlObjects = [];
        assignments.forEach((assignment) => {
            var objString = "(";
            objString += userId;
            objString += ", " + assignment.appId;
            objString += ", " + assignment.roleId;
            objString += ", " + assignment.clientId;
            objString += ", " + assignment.brandId;
            objString += ")";

            sqlObjects.push(objString);
        });

        var sql = "INSERT INTO UserAccess (userId, appId, roleId, clientId, brandId) ";
        sql += "VALUES " + sqlObjects.join(', ');

        //Execute SQL
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else if (results.affectedRows == 0) 
                    reject("An unexpected error was encountered while setting the User's (" + userId + ") Access. Please try again later.");
                else resolve(results);
            });
    });
}

exports.access.deleteAll = (userId) => {
    return new Promise(function(resolve, reject){
        //Validation
        if (isNaN(userId)) 
            reject("'" + userId + "' is and invalid userId");

        //Create SQL
        var sql = "DELETE FROM UserAccess WHERE userId = " + userId + ";";

        //Execute SQL
        connections.IntegrationServices.query(sql, 
            (error, results, fields) => {
                if (error) reject(error);
                else if (results.affectedRows == 0) reject("No records for userId '" + userId + "' could be found.");
                else resolve(results);
            });
    });
}

module.exports = exports;
