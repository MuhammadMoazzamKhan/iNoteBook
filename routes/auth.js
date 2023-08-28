const express = require("express")
const User = require("../models/User")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser")

const JWT_SECRET = "moazzamis$here"

router.post("/createuser", [
    body('name', "Enter the valid name").isLength({ min: 3, max: 20 }),
    body('email', "Enter the unique email").isEmail(),
    body('password', "Enter the valid password").isLength({ min: 5 })
], async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.send({ errors: result.array() });
        }
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" });
        }
        const salt = await bcrypt.genSaltSync(10);
        const secPass = await bcrypt.hashSync("B4c0/\/", salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);

        // res.json(user)
        res.json({ authToken })

    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }
})


router.post("/login", [
    body('email', "Enter a valid enmail").isEmail(),
    body("password", "Password cannot be blank").exists()
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        res.send({ errors: result.array() });
    }

    const { email, password } = req.body;
    try{
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password , user.password);

        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ authToken })
    }catch(error){
        res.status(500).send("Some error occured")
    }
})

router.post('/getuser', fetchuser , async(req,res)=>{
    try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
    
    } catch (error) {
        console.log("error",error);
        res.status(500).send("Interal server error");
    }
})
    

module.exports = router