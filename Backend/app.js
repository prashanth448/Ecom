const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { request, response } = require('express');
 //secretKey="secretkey"

const app = express();
app.use(express.json())

app.use(cors())
const userSchema = {
    name : {type:String, required: true},
    email : {type:String, required:true},
    password : {type:String, required:true}
}


//register section 
const mongoModel = mongoose.model("userCollection",userSchema)
mongoose.connect("mongodb://localhost:27017/Database").then(()=>console.log("Connected..")).catch((e)=> console.log("Errorrr",e))
app.get('/',(request,response) => {
    response.send("Hello World")
})

app.post('/add',async(request, response) => {
    console.log(request.body)

    const {name,email,password} = request.body
    
    const data = new mongoModel({name:name,email:email,password:password})

    const value = await data.save()
    let payload = {subject:data._id}
    let token = jwt.sign(payload,"secretKey")
    return response.send({token}) 
    
}) 

//verify token 

const verifyToken = (req,res,next) => {
    console.log(req.headers)
    const tokenV = req.headers['authorization'].split(" ")[1] 
    console.log(tokenV)
    if(tokenV)
    {
   const decode = jwt.verify(tokenV,"secretKey")
   req.decode=decode
   return next();
    }
    
}


//get products 



//products add section 
const productSchema = {
    imageUrl : {type:String},
    title : {type:String},
    description : {type: String},
    price : {type:String}
}
const productModel = mongoose.model("productcollections", productSchema)

 /*app.post('/addproduct', verifyToken, async(request,response) => {
    const {imageUrl,title,description,price} = request.body
    
    const details = new productModel({imageUrl:imageUrl,title:title, description:description ,price:price})
    const val = await details.save()
    console.log(val)
})  */

app.get('/getproducts', verifyToken,async(req,res) => {
    if(req.decode){
    const data= await productModel.find() 
    return res.send(data)
    }
    else{
         return res.json("invalid token")
    }
 } )

//login user section
app.post('/login',(request, response) => {
    let useeData = request.body
    
    mongoModel.findOne({email : useeData.email}, (error, user) => {
        if (error){
            console.log(error)
        }else {
            if (!user) {
                response.status(401).send("Invalid Email")
            }else {
                if (user.password !== useeData.password) {
                    response.status(401).send("Invalid Password")
                }else {
                    let payload = {subject : user._id}
                    let token = jwt.sign(payload, "secretKey")

                    response.status(200).send({token})
                }
            }
        }
    })
})





app.listen(3000,()=>console.log("Running..."))