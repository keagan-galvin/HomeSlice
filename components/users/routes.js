const express = require("express");
const common = require("../../common");

const user = require("./model");

const router = express.Router();
const successResponse = common.responses.successResponse;

//Get
router.get('/', (req, res, next) => {
    user.find({
        email: req.query.email
    }, function (error, user) {
        if (error) next(error);
        else res.status(200).json(successResponse(user));
    }).catch(next);
});

//// Create
// router.post('/', (req, res, next) => {
//     services.roles.create(req.body.name, req.body.description).then(
//         (results) => res.status(200).json(successResponse({
//             id: results.insertId,
//             message: "Successfully created."
//         })),
//         (error) => next(error)).catch(next);
// });

//// Update
// router.patch('/:id', (req, res, next) => {
//     services.roles.update(req.params.id, req.body.name, req.body.description).then(
//         (results) => res.status(200).json(successResponse("Update Successful.")), (error) => next(error)).catch(next);
// });

//// Delete
// router.delete('/:id', (req, res, next) => {
//     services.roles.delete(req.params.id).then(
//         (results) => res.status(200).json(successResponse("Delete Successful.")),
//         (error) => next(error)).catch(next);
// });

module.exports = router;