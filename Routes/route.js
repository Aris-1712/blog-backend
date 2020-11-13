const express = require('express')
const Router = express.Router()
const Blog = require('../DBModels/Blog')
const User = require('../DBModels/User')
const slugify = require('slugify')
const jwt=require('jsonwebtoken')
const Joi = require('joi')
const Bcrypt = require('bcrypt')
const auth=require('../Middleware/auth')
const Blogschema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().required(),
    img:Joi.string().required(),
    userid:Joi.string().required(),
    useremail:Joi.string().required()
})
const UserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
})
Router.get('/', async (req, res) => {
    res.render("test", { message: "Blog Api" })

})

Router.post('/new', auth,async (req, res) => {
    try{
    console.log(req.body)
    let check = await JoiValidate(req.body)
    if (!check.error) {
        let slug = slugify(req.body.name, { lower: true })
        let uniquecheck = await Blog.find({ slug: slug })
        if (uniquecheck.length !== 0) {
            let uniquecheck2 = await Blog.find({ slug: new RegExp('^' + slug + '-', 'i') })
            let blog = new Blog({ name: req.body.name,img:req.body.img,useremail:req.body.useremail,userid:req.body.userid,date:new Date(), desc: req.body.desc, slug: slug + "-" + parseInt(uniquecheck2.length + 1) })
            let save = await blog.save()
            res.send(save)
        } else {
            let blog = new Blog({ name: req.body.name,useremail:req.body.useremail,img:req.body.img,userid:req.body.userid,date:new Date(), desc: req.body.desc, slug: slug })
            let save = await blog.save()
            res.status(200).send(save)
        }
    }
    else {
        res.status(400).send("Invalid Call")
    }
}catch(err){
    res.status(400).send("Invalid Call")
}
})
Router.get('/all', async (req, res) => {
    let data = await Blog.find()
    res.send(data)
})

Router.post('/edit',auth,async(req,res)=>{
    try{
    if (req.body.name && req.body._id && req.body.img && req.body.desc) {
        let blog=await Blog.findById(req.body._id)
       
        if(blog){
            blog.name=req.body.name
            blog.desc=req.body.desc
            blog.img=req.body.img
            let result=await blog.save()
            res.send("Updated")
        }else{
            res.status(400).send("Invalid Call") 
        }
    }else{
        res.status(400).send("Invalid parameters") 
    }
}catch(err){
    res.status(400).send("Invalid parameters") 
}
})
Router.post('/delete',auth,async(req,res)=>{
    try{
    if (req.body._id) {
        let blog=await Blog.findByIdAndRemove(req.body._id)
        res.send("Deleted")
        }else{
            res.status(400).send("Invalid Call") 
        }
    
}catch(err){
    res.status(400).send("Invalid parameters") 
}
})

Router.get('/blog/:slug', async (req, res) => {

    let data = await Blog.find({ slug: req.params.slug })
    if (data.length !== 0) {
        res.send(data)
    } else {
        res.sendStatus(404).send("NOT FOUND")
    }
})

Router.post('/signup', async (req, res) => {
    try {
        let check = await JoiUserValidate(req.body)
        if (!check.error) {
            let duplicateCheck = await User.find({ email: req.body.email })
            if (duplicateCheck.length === 0) {
                const salt = await Bcrypt.genSalt(10)
                const hashed = await Bcrypt.hash(req.body.password, salt)
                const user = new User({ email: req.body.email, password: hashed })
                let save = await user.save()
                res.send({ message: "User Created Successfully.", email: save.email, _id: save._id })
            }
            else {
                res.send({ message: "Email already exists" })
            }
        }
        else {
            res.send("Invalid parameters")
        }
    } catch (err) {
        res.send(err)
    }
})

Router.post("/test",auth,(req,res)=>{
    res.send({...req.body,_id:req._id})
})

Router.post('/signin', async (req, res) => {
    
    try {
        let check = await JoiUserValidate(req.body)
        if (!check.error) {
            let duplicateCheck = await User.find({ email: req.body.email })
            if (duplicateCheck.length === 1) {
                let unhashed = await Bcrypt.compare(req.body.password,duplicateCheck[0].password)
                if(unhashed){
                    let token=jwt.sign({_id:duplicateCheck[0]._id},process.env.KEY)
                    res.header({"x-auth-token":token}).send({_id:duplicateCheck[0]._id,email:duplicateCheck[0].email})
                }
                else{
                    res.send({message:"Invalid email/password"})
                }
         
            }
            else {
                res.send({ message: "Email does not exist" })
            }
        }
        else {
            res.send("Invalid parameters")
        }
    } catch (err) {
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