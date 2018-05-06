const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const common = require('../common');
const connections = require("../connections");
const config = require('../config');

const routeSecurity = config.security.routing;

const errorMsg = {
        invalidAuthorization: "Invalid Authorization.",
        accessDenied: "Insufficient Permissions."
}

var exports = {
    auth: {},
    routeSecurity: {
        validation: {}
    }
};

//Authorization
exports.auth.login = (user, password) => {
    return new Promise((resolve, reject) => {
        if (user.hash == genHash(password, user.salt).hash)
            resolve({ 
                token: jwt.sign({ data: user }, config.security.passphrase, { expiresIn: config.security.tokenLifespan }), 
                expiresIn: config.security.tokenLifespan
            });
        else reject("Invalid Password.");
    });    
}

exports.auth.refresh = (token) => {
    return new Promise((resolve, reject) => {
        var originalDecoded = jwt.verify(token, config.security.passphrase);
        resolve({ 
            token: jwt.sign({ data: originalDecoded.data }, config.security.passphrase, { expiresIn: config.security.tokenLifespan }), 
            expiresIn: 60 * 60
        });
    });
}


const getAppId = (req) => {
    var appId = -1;
    for(var app in config.apps){
        if (config.apps[app].path == req.baseUrl) {
            appId = app.id;
        }
    }
    return appId;
}

exports.routeSecurity.protected = (req, res, next) => {
    //Set AppID    
    const appId = getAppId(req);
    if (appId == -1) next("App not configured.");
    
    //Validate Authorization
    const auth = req.get("Authorization");
    if (auth) 
        if(auth.indexOf("Bearer " == 0))
            jwt.verify(req.get("Authorization").replace("Bearer ", ""), config.security.passphrase, (err, decoded) => {
                if (err) next(err);
                else {                    
                    const method = req.method.toUpperCase()
                    const user = decoded.data;

                    //Can read   
                    if (method == "GET"){
                        if (canUseMethod(user, appId, routeSecurity.readId)) next();
                        else next(errorMsg.accessDenied);
                    }      
                    //Can create              
                    else if (method == "POST"){
                        if (canUseMethod(user, appId, routeSecurity.createId)) next();
                        else next(errorMsg.accessDenied);
                    }        
                    //Can update
                    else if (method == "PATCH") {
                        if (canUseMethod(user, appId, routeSecurity.updateId)) next();
                        else next(errorMsg.accessDenied);
                    }  
                    //Can delete             
                    else if (method == "DELETE"){
                        if (canUseMethod(user, appId, routeSecurity.deleteId)) next();
                        else next(errorMsg.accessDenied);
                    }
                    //Can't do anything
                    else next("Unaccepted HTTP Method");
                } 
            });        
        else next(errorMsg.invalidAuthorization);
    else next(errorMsg.invalidAuthorization);
}

exports.routeSecurity.master = (req, res, next) => {
    //Set AppID    
    const appId = getAppId(req);
    if (appId == -1) next("App not configured.");
    
    //Validate Authorization
    var auth = req.get("Authorization");
    if (auth) 
        if(auth.indexOf("Bearer " == 0))
            jwt.verify(req.get("Authorization").replace("Bearer ", ""), config.security.passphrase, function(err, decoded) {
                if (err) next(err);
                else {
                    if (canUseMethod(decoded.data, req.appId, routeSecurity.masterId)) next();
                    else next(errorMsg.accessDenied);
                } 
            });        
        else next(errorMsg.invalidAuthorization);
    else next(errorMsg.invalidAuthorization);
}

const canUseMethod = (user, appId, role) => {
    return (user.access.filter(function(e, i) {
        return ((e.appId == appId || e.appId == config.apps.master.id) && (e.roleId == role || e.roleId == routeSecurity.masterId));
    }).length > 0);
}
exports.routeSecurity.canUseMethod = canUseMethod;

const genSalt = (length) => {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0,length);
}
exports.auth.genSalt = genSalt;

const genHash = (val, salt) => {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(val);
    var value = hash.digest('hex');
    return {
        salt:salt,
        hash:value
    };
}
exports.auth.genHash = genHash;

const hashPassword = (password) => {
    var salt = genSalt(16);
    return genHash(password, salt);
}
exports.auth.hashPassword = hashPassword;

const validateHash = (password, hash, salt) => {
    return (hash == genHash(password, salt));
}
exports.auth.genHash = validateHash;

module.exports = exports;
