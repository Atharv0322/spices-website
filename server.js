const express = require("express");

const mongoose = require("mongoose");

const nodemailer = require("nodemailer");

const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();

/* =========================================
   EMAIL TRANSPORTER
========================================= */

const transporter = nodemailer.createTransport({

    host:"smtp.resend.com",

    port:465,

    secure:true,

    auth:{

        user:"resend",

        pass:"re_JeCn3bia_aLtYdyAA9XzoLbz8NiWKxcN4"

    }

});

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());

app.use(bodyParser.json({

    limit:"50mb"

}));

app.use(bodyParser.urlencoded({

    limit:"50mb",

    extended:true

}));

app.use(express.static("public"));

/* =========================================
   MONGODB CONNECTION
========================================= */

mongoose.connect(

    "mongodb+srv://atharv0322:atharv123@cluster0.h5zudqr.mongodb.net/spicesDB?retryWrites=true&w=majority"

)

.then(()=>{

    console.log("✅ MongoDB Connected");

})

.catch((err)=>{

    console.log(err);

});

/* =========================================
   PRODUCT SCHEMA
========================================= */

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    image:{
        type:String,
        required:true
    },

    badge:String,

    reviews:[

        {

            username:String,

            rating:Number,

            comment:String

        }

    ]

});

/* PRODUCT MODEL */

const Product = mongoose.model(

    "Product",

    productSchema

);

/* =========================================
   ORDER SCHEMA
========================================= */

const orderSchema = new mongoose.Schema({

    orderId:{

        type:String,

        unique:true

    },

    customerName:{

        type:String,

        required:true

    },

    email:{

        type:String,

        required:true

    },

    phone:{

        type:String,

        required:true

    },

    address:{

        type:String,

        required:true

    },

    paymentMethod:{

        type:String,

        required:true

    },

    items:Array,

    total:Number,

    status:{

        type:String,

        default:"Order Placed"

    },

    createdAt:{

        type:Date,

        default:Date.now

    }

});

/* ORDER MODEL */

const Order = mongoose.model(

    "Order",

    orderSchema

);

/* =========================================
   PRODUCTS API
========================================= */

/* ADD PRODUCT */

app.post("/add-product", async (req,res)=>{

    try{

        const {

            name,

            description,

            price,

            image,

            badge

        } = req.body;

        if(

            !name ||
            !description ||
            !price ||
            !image

        ){

            return res.status(400).json({

                success:false,

                message:"❌ Fill all product fields"

            });

        }

        const product = new Product({

            name,

            description,

            price,

            image,

            badge,

            reviews:[]

        });

        await product.save();

        res.json({

            success:true,

            message:"✅ Product Added"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* GET PRODUCTS */

app.get("/products", async (req,res)=>{

    try{

        const products = await Product.find();

        res.json(products);

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* UPDATE PRODUCT */

app.put("/update-product/:id", async (req,res)=>{

    try{

        await Product.findByIdAndUpdate(

            req.params.id,

            {

                name:req.body.name,

                description:req.body.description,

                price:req.body.price,

                image:req.body.image,

                badge:req.body.badge

            }

        );

        res.json({

            success:true,

            message:"✅ Product Updated"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* DELETE PRODUCT */

app.delete("/delete-product/:id", async (req,res)=>{

    try{

        await Product.findByIdAndDelete(

            req.params.id

        );

        res.json({

            success:true,

            message:"🗑️ Product Deleted"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* ADD REVIEW */

app.post("/add-review/:id", async (req,res)=>{

    try{

        const product = await Product.findById(

            req.params.id

        );

        product.reviews.push({

            username:req.body.username,

            rating:req.body.rating,

            comment:req.body.comment

        });

        await product.save();

        res.json({

            success:true,

            message:"⭐ Review Added"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* =========================================
   ORDER API
========================================= */

/* PLACE ORDER */

app.post("/place-order", async (req,res)=>{

    try{

        const {

            orderId,

            customerName,

            email,

            phone,

            address,

            paymentMethod,

            items,

            total

        } = req.body;

        if(

            !customerName ||
            !email ||
            !phone ||
            !address ||
            !paymentMethod

        ){

            return res.status(400).json({

                success:false,

                message:"❌ Missing order details"

            });

        }

        if(items.length === 0){

            return res.status(400).json({

                success:false,

                message:"❌ Cart is empty"

            });

        }

        const order = new Order({

            orderId,

            customerName,

            email,

            phone,

            address,

            paymentMethod,

            items,

            total,

            status:"Order Placed"

        });

        await order.save();

        /* SEND EMAIL IN BACKGROUND */

        transporter.sendMail({

            from:"Atharv Masala <onboarding@resend.dev>",

            to:email,

            subject:"Your Atharv Masala Order is Confirmed 🌶️",

            html:`

                <div
                    style="
                        font-family:Arial;
                        padding:20px;
                    "
                >

                    <h2>
                        ✅ Order Confirmed
                    </h2>

                    <p>

                        Hello ${customerName},

                    </p>

                    <p>

                        Your order has been placed successfully.

                    </p>

                    <h3>

    Order ID:
    ${orderId}

</h3>

<a

    href="https://spices-website-ynf3.onrender.com/track-order.html?orderId=${orderId}"

    style="
        display:inline-block;
        margin-top:20px;
        padding:12px 20px;
        background:#ff7a00;
        color:white;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
    "

>

    📦 Track Your Order

</a>

                    <p>

                        Thank you for shopping with
                        Atharv Masala 🌶️

                    </p>

                </div>

            `

        })

        .then(()=>{

            console.log(
                "✅ Customer Email Sent"
            );

        })

        .catch((error)=>{

            console.log(
                "❌ Email Error",
                error
            );

        });

        res.json({

            success:true,

            message:"🎉 Order Placed Successfully",

            orderId:orderId

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"❌ Server Error"

        });

    }

});

/* GET ALL ORDERS */

app.get("/orders", async (req,res)=>{

    try{

        const orders = await Order.find()

        .sort({

            createdAt:-1

        });

        res.json(orders);

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* TRACK ORDER */

app.get("/track-order/:orderId", async (req,res)=>{

    try{

        const order = await Order.findOne({

            orderId:req.params.orderId

        });

        if(!order){

            return res.status(404).json({

                success:false,

                message:"❌ Order Not Found"

            });

        }

        res.json({

            success:true,

            order:order

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* UPDATE ORDER STATUS */

app.put(

    "/update-order-status/:id",

    async (req,res)=>{

        try{

            await Order.findByIdAndUpdate(

                req.params.id,

                {

                    status:req.body.status

                }

            );

            res.json({

                success:true,

                message:"✅ Status Updated"

            });

        }

        catch(err){

            console.log(err);

            res.status(500).json({

                success:false

            });

        }

    }

);

/* =========================================
   DEFAULT ROUTE
========================================= */

app.get("/", (req,res)=>{

    res.send("🚀 Atharv Masala Backend Running");

});

/* =========================================
   START SERVER
========================================= */

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, ()=>{

    console.log(

        `🚀 Server running on port ${PORT}`

    );

});