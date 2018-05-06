const express = require("express");

const config = require("../config");
const common = require("../common");

const services = require("./services");
const routeSecurity = require("../auth/services").routeSecurity;

const router = express.Router();
const successResponse = common.responses.successResponse;

//GET Users by id or email
router.get('/', routeSecurity.protected,(req,res,next) => {
    try {
        if (req.query.email) {
            services.findByEmail(req.query.email).then(
                (userResults) => {
                    if (userResults.length == 1) {
                        services.access.getAll(userResults[0].id).then(
                            (accessResults) => {
                                userResults[0].access = accessResults;
                                res.status(200).json(successResponse(userResults[0]));
                            },
                            (error) => next(error));
                    } else res.status(200).json(successResponse(userResults));
                },
                (error) => next(error)).catch(next);
        } 
        else if (req.query.id) {
            services.findById(req.query.id).then(
                (userResults) => {
                    if (userResults.length == 1) {
                        services.access.getAll(userResults[0].id).then(
                            (accessResults) => {
                                userResults[0].access = accessResults;
                                res.status(200).json(successResponse(userResults[0]));
                            },
                            (error) => next(error));
                    }
                    else next("No user with that Id could be found.");
                },
                (error) => next(error)).catch(next);
        }
        else next("An ID or Email must be specified.");


    } catch (error) {
        next(error);
    }    
});

//Create User
router.post('/', routeSecurity.protected, (req,res,next) => {
    
    services.access.validate(req.body.access).then(
        (success) => services.findByEmail(req.body.email).then(
            (userResults) => { 
                if (userResults.length == 0)
                    services.create(req.body.email, req.body.password, []).then(
                        (memberResults) => services.access.create(memberResults.insertId, req.body.access).then(
                                (accessResults) => res.status(200).json(successResponse({ 
                                    userId: memberResults.insertId, 
                                    message: "User successfully created with (" + accessResults.affectedRows + ") access assignments." 
                                })),
                                (error) => next(error)).catch(next),
                        (error) => next(error)).catch(next); 
                else next("A User with that email already exists.")
            },
            (error) => next(error)).catch(next),
        (error) => next(error)).catch(next);        
});

//Update User
router.patch('/:id', routeSecurity.protected, (req, res, next) => {
    if (req.body.email || req.body.password){
        services.update(req.params.id, req.body.email, req.body.password).then(
            (userResults) => services.access.validate(req.body.access).then(
                (success) => services.access.deleteAll(req.params.id).then(
                    (deleteResults) => services.access.create(req.params.id, req.body.access).then(
                        (createResults) => res.status(200).json(successResponse("Update successful.")),
                        (error) => next(error)).catch(next),
                    (error) => next(error)).catch(next),              
                (error) => res.status(200).res.json(successResponse("Update successful."))).catch(next),
            (error) => next(error)).catch(next);
    } else if (req.body.access){
        services.access.validate(req.body.access).then(
            (success) => services.access.deleteAll(req.params.id).then(
                (deleteResults) => services.access.create(req.params.id, req.body.access).then(
                    (createResults) => res.status(200).json(successResponse("Update successful.")),
                    (error) => next(error)).catch(next),
                (error) => next(error)).catch(next),
            (error) => next(error)).catch(next);
    } else next("No update parameters provided.");
});

//Delete User
router.delete('/:id', routeSecurity.protected, (req,res,next) => {
    services.access.deleteAll(req.params.id).then(
        (accessResults) => services.delete(req.params.id).then(
            (userResults) => res.status(200).json("User (" + req.params.id + ") successfully deleted."),
            (error) => next(error)).catch(next),
        (error) => next(error)).catch(next);      
});

module.exports = router;