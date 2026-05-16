const express = require("express");

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();

/* MIDDLEWARE */

app.use(cors());

app.use(bodyParser.json({

    limit:"50mb"

}));

app.use(bodyParser.urlencoded({

    limit:"50mb",

    extended:true

}));

app.use(express.static("public"));

/* MONGODB CONNECTION */

mongoose.connect(

    "mongodb://127.0.0.1:27017/spicesDB"

)

.then(() => {

    console.log("✅ MongoDB Connected");

})

.catch(err => {

    console.log(err);

});

/* PRODUCT SCHEMA */

const productSchema = new mongoose.Schema({

    name:String,

    description:String,

    price:Number,

    image:String,

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

/* ORDER SCHEMA */

const orderSchema = new mongoose.Schema({

    customerName:String,

    phone:String,

    address:String,

    paymentMethod:String,

    items:Array,

    total:Number,

    status:{

        type:String,

        default:"Pending"

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

        const product = new Product({

            name:req.body.name,

            description:req.body.description,

            price:req.body.price,

            image:req.body.image,

            badge:req.body.badge,

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

        const products =
            await Product.find();

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

            success:true

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

            success:true

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

        const product =
            await Product.findById(

                req.params.id

            );

        product.reviews.push({

            username:req.body.username,

            rating:req.body.rating,

            comment:req.body.comment

        });

        await product.save();

        res.json({

            success:true

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

        console.log(req.body);

        const order = new Order({

            customerName:
                req.body.customerName,

            phone:
                req.body.phone,

            address:
                req.body.address,

            paymentMethod:
                req.body.paymentMethod,

            items:
                req.body.items,

            total:
                req.body.total,

            status:"Pending"

        });

        await order.save();

        res.json({

            success:true,

            message:"✅ Order Placed"

        });

    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

/* GET ORDERS */

app.get("/orders", async (req,res)=>{

    try{

        const orders =
            await Order.find();

        res.json(orders);

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

                success:true

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
   START SERVER
========================================= */

app.listen(3000, ()=>{

    console.log(

        "🚀 Server running on http://localhost:3000"

    );

});