const Sequelize = require('sequelize');
require("dotenv").config()

const isProduction = process.env.NODE_ENV === 'production';

module.exports =  new Sequelize('typ',!isProduction ? process.env.DB_USER : "null",!isProduction ? process.env.DB_PASSWORD: "null", {
    host: 'localhost',
    dialect: 'postgres',
    pool:{
        max: 5, 
        min: 0,
        idle: 10000                
      }
  });
