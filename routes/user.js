const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth')
const {authorize} = require('../middlewares/authorization');;

const db = require('../config/db')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const logger = require('../config/logger').userLogger


// router.get('/auth/register',(req,res)=>{
//     res.render('register')
// })

router.post('/auth/register',async(req,res)=>{
    let {username,firstname, lastname, email, password, password2} =req.body;
    logger.info(JSON.stringify(req.body
    ))
    logger.info(JSON.stringify({
        username,
        firstname,
        lastname,
        email,
        password,
        password2,
    }))

    let errors = [];
    if(!username || !firstname || !lastname || !password ||!email || !password2){
        errors.push({message : "Please enter all fields"})
    }

    if(password.length < 6){
        errors.push({message : "Password should be 6 characters"})
    }

    if(password !== password2){
        errors.push({message : "Passwords does not match"})
    }
    try{
        const hasUser = await User.findOne({where : {email: email}})
        if (hasUser){
            errors.push({message : "User already Registered"})
            logger.info(JSON.stringify(hasUser.toJSON()));
        }
    }catch(err){
        logger.error(err.toString())
    }

    if(errors.length > 0){
        res.status(422).send(errors)
    }else{
        try{
        
        // let hashPassword = await bcrypt.hash(password,8)
        const user = User.build({
            username: username,
            firstname: lastname,
            lastname: lastname,
            email: email,
            password: password,
            tokens: []
            
        })

        logger.info(user.username.toString())
        // const result = await user.save();
        const authToken = await user.setAuthToken();
        const  authTokenJSON= {authToken}
        logger.info(authToken)
        if(!authToken){
            errors.push({message: "Token Generation Failed"});
            res.status(422).send(errors)
        }else{
            logger.info(JSON.stringify(authToken));
            res.send(JSON.stringify(authTokenJSON))
        }
       
            
        
        
        }catch(error){
            logger.error(error.toString())
        }

    }


})

router.get('/users/register',(req,res)=>{
    res.render('register')
})

router.get('/users/login',(req,res)=>{
    res.render('login')
})

router.get('/users/all',auth,async (req,res)=>{
    try {
        const result=await User.getAllUsers()
        logger.info(result)
        const users = result.map(User =>{
            return User.dataValues;
        })
        logger.info(users)
        // const users = result.toJSON()
        res.send(users)
    } catch (error) {
        logger.error(error)
    }
})

router.post('/auth/login',auth,async (req,res)=>{
    try {
        let errors = []
        let {username,password} =req.body;
        logger.info(JSON.stringify({
            username,
            password

        }))
        const user = await User.findByCredentials(username,password)
        if(!user){
            errors.push({message: "Login failed"});
            res.status(422).send(errors);
            return
        }
        const token = await user.setAuthToken()
        res.send({user,token})
        if(!token){
            errors.push({message: "Login failed"});
            res.status(422).send(errors);
        }else{
            logger.info(JSON.stringify({user,token}));
            res.send(JSON.stringify({user,token}))
        }
    } catch (error) {
        logger.error(error)
    }
})

module.exports =  router