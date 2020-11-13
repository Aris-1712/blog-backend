const jwt=require('jsonwebtoken')

const auth=(req,res,next)=>{
    if(req.header("x-auth-token")){
        try{
        let token=req.header("x-auth-token")
        let payload=jwt.verify(token,process.env.KEY)
        req._id=payload._id
        next()
    }catch(err){
        res.send("Invalid Token")
    }
    }
    else{
        res.status(400).send("Bad request")
    }
}


module.exports=auth