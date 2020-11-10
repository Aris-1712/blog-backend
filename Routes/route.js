const express = require('express')
const Router = express.Router()
const Blog = require('../DBModels/Blog')
const User = require('../DBModels/User')
const slugify = require('slugify')
const Joi = require('joi')
const Bcrypt=require('bcrypt')
const Blogschema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().required()
})
const UserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
})
Router.get('/', async (req, res) => {
    res.render("test", { message: "Blog Api" })

})

Router.post('/new', async (req, res) => {
    let check = await JoiValidate(req.body)
    if (!check.error) {
        let slug = slugify(req.body.name, { lower: true })
        let uniquecheck = await Blog.find({ slug: slug })
        if (uniquecheck.length !== 0) {
            let uniquecheck2 = await Blog.find({ slug: new RegExp('^' + slug + '-', 'i') })
            let blog = new Blog({ name: req.body.name, desc: req.body.desc, slug: slug + "-" + parseInt(uniquecheck2.length + 1) })
            let save = await blog.save()
            res.send(save)
        } else {
            let blog = new Blog({ name: req.body.name, desc: req.body.desc, slug: slug })
            let save = await blog.save()
            res.send(save)
        }
    }
    else {
        res.render("test", { message: check.error })
    }

})
Router.get('/all', async (req, res) => {
    let data = await Blog.find()
    res.send(data)
})

Router.get('/blog/:slug', async (req, res) => {

    let data = await Blog.find({ slug: req.params.slug })
    if (data.length !== 0) {
        res.send(data)
    } else {
        res.sendStatus(404).send("NOT FOUND")
    }
})

Router.post('/signup',async(req,res)=>{
    try{
let check=await JoiUserValidate(req.body)
if(!check.error){
let duplicateCheck=await User.find({email:req.body.email})
if(duplicateCheck.length===0){
    const salt=await Bcrypt.genSalt(10)
    const hashed=await Bcrypt.hash(req.body.password,salt)
    const user=new User({email:req.body.email,password:hashed})
    let save=await user.save()
    res.send({message:"User Created Successfully.",email:save.email,_id:save._id})
}    
else{
    res.send({message:"Email already exists"})
}
}
else{
    res.send("Invalid parameters")
}
}catch(err){
    res.send(err)
}
})

const JoiValidate = async (obj) => {
    try {
        let res = await Blogschema.validateAsync(obj)
        return true
    }
    catch (err) {

        return { error: err.message }
    }
}
const JoiUserValidate = async (obj) => {
    try {
        let res = await UserSchema.validateAsync(obj)
        return true
    }
    catch (err) {

        return { error: err.message }
    }
}

module.exports = Router