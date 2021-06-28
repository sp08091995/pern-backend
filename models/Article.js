const Sequelize = require('sequelize');
const logger = require('../config/logger').articleLogger;
const db = require ('../config/db');

const Article = db.define('Article',{
    title:{
        type: Sequelize.STRING
    },
    description:{
        type: Sequelize.STRING
    },
    created_by:{
        type: Sequelize.STRING
    }
})

Article.getAllArticles = async function(){
    try {
        const articles= Article.findAll();
        return articles;
        
    } catch (error) {
        logger.info(error.toString())
        return;
    }
}

module.exports=Article;