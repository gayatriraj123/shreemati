const port = process.env.PORT || 4000; // Use Render's port or default to 4000
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer  = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");

app.use(express.json());
app.use(cors());

//Database connection with mongoDB
// mongoose.connect("mongodb+srv://gayatrirajguru2002:FMYGOEGby1po1G9z@cluster0.3bdvj.mongodb.net/");
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://gayatrirajguru2002:g7387568749@cluster0.dumq7yj.mongodb.net/e-commerce");


//api creation



app.get("/",(req,res)=>{
    res.send("Experss App is Running");
})

//Image storage ingine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({storage:storage})
//creating upload endpoint images
app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
})

//schema for creating products

const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,  
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//creating api for deleting product

app.post('/removeproduct',async(req,res) =>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })

})

//create api for getting all product

app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All Products fetched");
    res.send(products);
})

//SChema creating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//creating endpoint for registrating user
app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if (check) {
        return res.status(400).json({success:false,error:"existing user found with same email address "})
    }
    //user there is no user then create one empty cart
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,     
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();      //save user in DB

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({
        success:true,token
    })
})

//creating endpointfor user login

app.post('/login',async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"})
    }
})

//creating endpoint for newcollection data
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

//creating endpoint for popular women data
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

//crreating middleware to fetch user
    const fetchUser = async (req,res,next)=>{
        const token = req.header('auth-token');
        if (!token) {
            res.status(401).send({errors:"Please authenticate using valid token"})
        }
        else{
            try {
                const data = jwt.verify(token,'secret_ecom');
                req.user = data.user;
                next();
            } catch (error) {
                res.status(401).send({errors:"please authenticate using valid token"})
            }
        }
    }

//creating endpoint for adding in cart data
app.post('/addtocart',fetchUser,async(req,res)=>{
    // console.log(req.body,req.user);
    console.log("Added",req.body.itemId);

    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

//creating endpoint to remove product from cartdata
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

//craeting endpoint to get cartdata
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("getCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error)=>{
    if (!error) {
        console.log("Server Running on port "+port);
        
    }
    else{
        console.log("Error :"+error);
    }
})



// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });

  // Serve admin build on /admin route
  app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));
  app.get('/admin*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
  });
}

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error :" + error);
  }
});