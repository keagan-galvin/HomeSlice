const express = require("express");

const config = require("../config");
const common = require("../common");
const routeSecurity = require("../auth/services").routeSecurity;

const services = require("./services");

const router = express.Router();
const successResponse = common.responses.successResponse;

//Get All
router.get('/', routeSecurity.protected, (req, res, next) => {
    services.getAll().then(
        (results) => res.status(200).json(successResponse(results)),
        (error) => next(error)).catch(next);
});

//Create
router.post('/', routeSecurity.protected, (req, res, next) => {
    services.roles.create(req.body.name, req.body.description).then(
        (results) => res.status(200).json(successResponse({
            id: results.insertId,
            message: "Successfully created."
        })),
        (error) => next(error)).catch(next);
});

//Update
router.patch('/:id', routeSecurity.protected, (req, res, next) => {
    services.roles.update(req.params.id, req.body.name, req.body.description).then(
        (results) => res.status(200).json(successResponse("Update Successful.")), (error) => next(error)).catch(next);
});

//Delete
router.delete('/:id', routeSecurity.protected, (req, res, next) => {
    services.roles.delete(req.params.id).then(
        (results) => res.status(200).json(successResponse("Delete Successful.")),
        (error) => next(error)).catch(next);
});

module.exports = router;