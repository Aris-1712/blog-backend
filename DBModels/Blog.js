const Mongoose = require('mongoose')

const blogSchema = new Mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    date:{type:Date,required:true},
    userid:{type:String,required:true},
    useremail:{type:String,required:true}
})

const Blog = Mongoose.model("Blog", blogSchema)

module.exports = Blog
