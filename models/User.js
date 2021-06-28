const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const bcrypt = require('bcrypt')
const logger = require('../config/logger').userLogger

const User = db.define('User',{
    username: {
        type: Sequelize.STRING,
        allowNull: false ,
        unique: true,
        validate : {
            
        }
    },
    firstname: {
        type: Sequelize.STRING,
        allowNull: false 
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: false 
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false ,
        validate : {
            validatePwd(value) {
                const pwdRegEx = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$";
                if(value.length > 14 || value.length < 6 ){
                    throw new Error('Password must be minimum six characters and maximum 14 characters')
                }
                else if(!value.match(pwdRegEx)){
                    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
                }
            }

        }
    },      
    email: {
        type: Sequelize.STRING,
        allowNull: false ,
        unique: true,
        validate : {
            isEmail: true
        }
    }
    ,
    tokens: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    },
    
},
{
    instanceMethods: {
        setToken: async function(){
            try{
                const user = this
                logger.info("in Function")
                logger.info(user)
                const token = jwt.sign ({_id: user.username}, 'secretprivatekey')
                const tokens = await user.tokens
                if (tokens.length > 10){
                    tokens.shift();
                }
                tokens.concat(token);
                await user.save()
                return token
            }catch(err){
                logger.info(err)
                return
            }
        },
        getFullname: function() {
            return [this.firstname, this.lastname].join(' ');
        },
        findByCredentials : async (email,password)=> {
            const user = await User.findOne({ email })
            if(!user){
                throw new Error("Unable to login")
            }
        
            const isMatch = await bcrypt.compare(password,user.password)
        
            if(!isMatch){
                throw new Error("Unable to login")
            }
            
            return user;
        }
    },
    hooks: {
        beforeCreate: async function(user){
            if(this.password != user.password){
                user.password = await bcrypt.hash(user.password, 8)
            }
        }
    }
})

User.prototype.setAuthToken = async function (){
    try{
        const user = this
        logger.info("In Function setAuthToken")
        logger.info(user)
        const token = jwt.sign ({username: user.username}, 'secretprivatekey')
        var tokens = await user.tokens
        if (tokens.length > 10){
                tokens.shift();
            }
        tokens.concat(token);
        user.tokens = user.tokens.concat(token)
        await user.save()
        return token
    }catch(err){
        logger.error(err)
        return
    }
}

User.findByCredentials = async function (email,password) {
    try {
        const user = await User.findOne({ email })
        if(!user){
            return 
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return
        }
        
        return user;
    } catch (error) {
        logger.error(error.toString())
    }
}

User.getAllUsers = async function(){
    try {
        const users= User.findAll({attributes:['username','firstname','lastname','email','createdAt','updatedAt']});
        return users;
        
    } catch (error) {
        logger.error(error)
        return;
    }
}

// User.sync()
module.exports=User;