const express = require("express");
const userRouter= require('./routes/user')
const cors = require('cors')
const ejs = require('ejs')
const bodyParser = require("body-parser");
const path = require("path");

const db = require('./config/db')


db.authenticate().then(()=>{
    console.log('Connection has been established successfully.');
}).catch((err)=>{
    console.log(err);
})
const app= express();
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use(express.json())
app.use(userRouter)



app.set('view engine','ejs')

app.get('/',(req,res)=>{
    res.render('index')
})







const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port: ${PORT}`))