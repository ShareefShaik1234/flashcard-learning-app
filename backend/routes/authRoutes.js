const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* -------- Register -------- */

router.post("/register", async (req,res)=>{

 try{

  const existingUser = await User.findOne({
    $or: [
      { email: req.body.email },
      { username: req.body.username }
    ]
  });

  if(existingUser){
   return res.status(400).send("User already exists");
  }

  const hashed = await bcrypt.hash(req.body.password,10);

  const user = new User({
   username:req.body.username,
   email:req.body.email,
   password:hashed,
   score:0
  });

  await user.save();

  res.send("User Registered");

 }

 catch(err){
  res.status(500).send("Server error");
 }

});


/* -------- Login -------- */

router.post("/login", async(req,res)=>{

 try{

  const user = await User.findOne({email:req.body.email});

  if(!user) return res.status(400).send("User not found");

  const valid = await bcrypt.compare(req.body.password,user.password);

  if(!valid) return res.status(400).send("Wrong password");

  const token = jwt.sign({id:user._id},"secretkey");

  res.json({
   token: token,
   username: user.username
  });

 }

 catch(err){
  res.status(500).send("Server error");
 }

});

module.exports = router;