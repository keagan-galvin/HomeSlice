const express = require("express");
const router = express.Router();

//Components
const user = require("./users/routes");

//API ROUTES
router.use("/users", user);

module.exports = router;