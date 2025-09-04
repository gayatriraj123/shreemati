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



// app.get("/",(req,res)=>{
//     res.send("Experss App is Running");
// })

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

app.post('/addproduct', async (req, res) => {
    try {
        const { id, name, image, category, new_price, old_price } = req.body;
        
        // If ID is provided, it's an UPDATE operation
        if (id) {
            console.log('Updating product:', { id, name, new_price, old_price, category });
            
            const updatedProduct = await Product.findOneAndUpdate(
                { id: parseInt(id) },
                {
                    name: name,
                    new_price: parseFloat(new_price),
                    old_price: parseFloat(old_price),
                    category: category,
                    ...(image && { image: image }) // Only update image if provided
                },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(404).json({ success: false, error: "Product not found" });
            }

            console.log('Product updated successfully:', updatedProduct);
            return res.json({
                success: true,
                message: "Product updated successfully",
                product: updatedProduct
            });
        }
        
        // Otherwise, it's a NEW product (your existing code)
        console.log('Adding new product');
        let products = await Product.find({});
        let newId;
        if (products.length > 0) {
            let last_product_array = products.slice(-1);
            let last_product = last_product_array[0];
            newId = last_product.id + 1;
        } else {
            newId = 1;
        }
        
        const product = new Product({
            id: newId,
            name: name,
            image: image,
            category: category,
            new_price: parseFloat(new_price),
            old_price: parseFloat(old_price),
        });
        
        await product.save();
        console.log("Saved new product");
        res.json({
            success: true,
            name: name,
        });
        
    } catch (error) {
        console.error('Add/Update product error:', error);
        res.status(500).json({ success: false, error: "Failed to process product" });
    }
});

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



// Update product - FIXED
app.post('/updateproduct', async (req, res) => {
    try {
        const { id, name, new_price, old_price, category } = req.body;
        
        console.log('Updating product:', { id, name, new_price, old_price, category });
        
        const updatedProduct = await Product.findOneAndUpdate(
            { id: parseInt(id) }, // Convert to number
            {
                name: name,
                new_price: parseFloat(new_price),
                old_price: parseFloat(old_price),
                category: category
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }

        console.log('Product updated successfully:', updatedProduct);
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
        
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, error: "Failed to update product" });
    }
});


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

// Add this with your other schemas
const Order = mongoose.model("Order", {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    items: [{
        productId: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    totalAmount: Number,
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing'
    },
    shippingAddress: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create new order
app.post('/createorder', fetchUser, async (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, shippingAddress } = req.body;
        
        const order = new Order({
            userId: req.user.id,
            items: items,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            shippingAddress: shippingAddress
        });

        await order.save();
        res.json({ success: true, orderId: order._id, message: "Order created successfully" });
        
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
});

// Update payment status
app.post('/updatepayment', fetchUser, async (req, res) => {
    try {
        const { orderId, paymentStatus, transactionId } = req.body;
        
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: paymentStatus,
            ...(transactionId && { transactionId: transactionId })
        });

        res.json({ success: true, message: "Payment status updated" });
        
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update payment" });
    }
});

// Clear user's cart
app.post('/clearcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        let emptyCart = {};
        for (let i = 0; i < 300; i++) {
            emptyCart[i] = 0;
        }
        
        userData.cartData = emptyCart;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: emptyCart });
        
        res.json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to clear cart" });
    }
});

// Get user's orders
app.get('/myorders', fetchUser, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch orders" });
    }
});

// app.listen(port,(error)=>{
//     if (!error) {
//         console.log("Server Running on port "+port);
        
//     }
//     else{
//         console.log("Error :"+error);
//     }
// })



// ... all your API routes first ...

// ====== PUT ALL YOUR API ROUTES ABOVE THIS LINE ======

// Serve static files in development
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode: Serving frontend and admin from local servers');
  
  // Enable CORS for local development
  app.use(cors({
    origin: ['http://localhost:4000', 'http://localhost:3000', 'http://localhost:5173', 'https://shreemati.onrender.com'],
    credentials: true
  }));
  
} else {
  // Production: Serve built files - BUT ONLY FOR NON-API ROUTES
  console.log('Production mode: Serving built files');
  
  // Serve frontend build - BUT ONLY FOR NON-API ROUTES
  const frontendPath = path.join(__dirname, '../frontend/build');
  if (require('fs').existsSync(frontendPath)) {
    // Serve static files for non-API routes
    app.use(express.static(frontendPath));
    app.get('/', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.log('Frontend build not found at:', frontendPath);
  }

  // Serve admin build on /admin route - BUT ONLY FOR NON-API ROUTES
  const adminPath = path.join(__dirname, '../admin/dist');
  if (require('fs').existsSync(adminPath)) {
    app.use('/admin', express.static(adminPath));
    app.get('/admin*', (req, res) => {
      res.sendFile(path.join(adminPath, 'index.html'));
    });
  } else {
    console.log('Admin build not found at:', adminPath);
  }
}

// ====== KEEP app.listen AT THE VERY END ======
app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error :" + error);
  }
});