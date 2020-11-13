
const env = require('dotenv')
env.config()
const Router = require('./Routes/route')
const helmet = require('helmet')
const mongoose = require('mongoose')
const express = require('express')
const cors=require('cors')
const app = express()
app.use(cors({
    exposedHeaders: ['x-auth-token'],
  }))
app.use(helmet())
app.use(express.json())
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());
let port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Connected to ${port}`)
})
mongoose.connect('mongodb+srv://aris:Arisgani1712@cluster0.ik8yo.mongodb.net/Blog?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    app.use('/', Router)
    console.log("connected")
})


