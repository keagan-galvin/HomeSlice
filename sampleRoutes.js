const express = require("express");
const router = express.Router();

//SAMPLE GET REQUEST
router.get('/', (req,res) => {
    // DO_STUFF();

    //SEND RESPONSE
    res.send("GET REQUEST SUCCESSFUL");
});

//SAMPLE POST REQUEST
router.post('/', (req,res,next) => {
    // DO_STUFF();
    
    //SEND RESPONSE
    res.send({
        message: "POST REQUEST SUCCESSFUL", 
        request: req.body 
    });
})

//DELETE REQUEST SAMPLE
router.delete('/:id', (req,res,next) => {
    // DO_STUFF();
    
    //SEND RESPONSE
    res.send("DELETE REQUEST SUCCESSFUL FOR ID: " + req.params.id);
});

module.exports = router;