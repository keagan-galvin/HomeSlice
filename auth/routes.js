const express = require("express");

const config = require("../config");
const common = require("../common");
const users = require("../users/services");

const services = require("./services");

const router = express.Router();
const successResponse = common.responses.successResponse;

//GET AUTH TOKEN
router.get('/', (req,res,next) => {
    try {        
        var authorization = req.get("Authorization");
        if (authorization.indexOf("Basic ") != 0) next("Invalid Authorization.");
        else {
            authorization = authorization.replace("Basic ","");
            authorization = Buffer.from(authorization, 'base64').toString("ascii");
            const email = authorization.split(":")[0];
            const password = authorization.split(":")[1];
            
            //Locate User
            users.findByEmail(email).then(
                (userResults) => {
                    if (userResults.length == 1) 
                        users.access.getAll(userResults[0].id).then(
                            (accessResults) => {
                                userResults[0].access = accessResults;
                                services.auth.login(userResults[0], password).then(
                                    (token) => res.status(200).json(successResponse(token)),
                                    (error) => next(error))
                            },
                            (error) => next(error));
                    else next("Username/Password combination not found.");
                },
                (error) => next(error));
        }
    }
    catch (error) { next(error) }
});

//GET REFRESHED TOKEN
router.get('/Refresh', (req,res,next) => {
    try {        
        var authorization = req.get("Authorization");
        if (authorization.indexOf("Bearer ") != 0) next("Invalid Authorization.");
        else {
            services.auth.refresh(authorization.replace("Bearer ","")).then(
                (token) => res.status(200).json(successResponse(token)),
                (error) => next(error));
        }
    }
    catch (error) { next(error) }
});

module.exports = router;