const express = require('express');
const Article = require('../models/article');
const User = require('../models/user');
const logger = require('../config/logger');
const auth = require('../middlewares/auth');

module.exports = (app,passport)=>{
    const router = express.Router();
    router.post('/new', auth.checkAuthenticated, async (req,res)=>{
        const loggedUser = new User(
            await req.user
        ) 

        const article = new Article({
            ...req.body,
            owner: await loggedUser.id
        })
        console.log("loggedUser: ",loggedUser.id)
        console.log(article)

        try {
            const result = await article.save()
            if(!result){
                return res.status(422).send("Unable to Save")
            }
            res.send("Article Saved: "+JSON.stringify(result))
        } catch (error) {
            console.log("Error at /articles: "+error)
            return res.status(422).send(error.toString())
            
        }
    })

    router.get('/articles', async (req, res) => {
        try {
            const articles = await Article.find({})
            res.send(articles)
        } catch (e) {
            res.status(500).send()
        }
    })
    
    router.get('/:id', async (req, res) => {
        const _id = req.params.id
    
        try {
            const article = await Article.findById(_id)
    
            if (!article) {
                return res.status(404).send()
            }
    
            res.send(article)
        } catch (e) {
            res.status(500).send()
        }
    })
    
    router.patch('/:id', async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['description', 'completed']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }
    
        try {
            const article = await Article.findById(req.params.id)
    
            updates.forEach((update) => article[update] = req.body[update])
            await article.save()
    
            if (!article) {
                return res.status(404).send()
            }
    
            res.send(article)
        } catch (e) {
            res.status(400).send(e)
        }
    })
    
    router.delete('/:id', async (req, res) => {
        try {
            const article = await Article.findByIdAndDelete(req.params.id)
    
            if (!article) {
                res.status(404).send()
            }
    
            res.send(article)
        } catch (e) {
            res.status(500).send()
        }
    })
    


    return router;
}