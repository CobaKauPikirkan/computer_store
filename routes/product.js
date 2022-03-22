const express = require("express")
const app = express()
app.use(express.json())

//import multer
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//import model
const models = require("../models/index")
const product = models.product

//config storage image
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,"./image/product")
    },
    filename: (req,file,cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

//method get
    app.get("/",async (req,res) =>{
    product.findAll()
    .then(result => {
            res.json({
                admin : result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})
// method get by id
app.get("/:product_id", (req, res) => {
    product
        .findOne({ where: { product_id: req.params.product_id } })
        .then((result) => {
            res.json({
                product: result
            });
        })
        .catch((error) => {
            res.json({
                message: error.message
            });
        });
});
//methodd post
app.post("/",upload.single("image"), (req,res) => {
    if(!req.file) {
        res.json({
            message: "No uploaded file"
        })
    }else{
    let data = {
        name : req.body.name,
        price : req.body.price,
        stock : req.body.stock,
        image : req.file.filename
    }

    product.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    }
    
})

//emdpoint method put
app.put("/:id", upload.single("image"), (req, res) => {
    let param = { product_id: req.params.id };
    let data = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.file.filename,
    };
    if (req.file) {
        // get data by id
        const row = product
            .findOne({ where: param })
            .then((result) => {
                let oldFileName = result.image;

                // delete old file
                let dir = path.join(__dirname, "../image/product", oldFileName);
                fs.unlink(dir, (err) => console.log(err));
            })
            .catch((error) => {
                console.log(error.message);
            });

        // set new filename
        data.image = req.file.filename;
    }

    if (req.body.password) {
        data.password = md5(req.body.password);
    }

    product
        .update(data, { where: param })
        .then((result) => {
            res.json({
                message: "data has been updated"
            });
        })
        .catch((error) => {
            res.json({
                message: error.message
            });
        });
});
//endpoint delete
app.delete("/:id", async (req,res) =>{
    try{
        let param = {product_id: req.param.product_id}
        let result = await product.findOne({where:param})
        let oldFileName = result.image

        //delete old file 
        let dir = path.join(__dirname,"../iamge/product",oldFileName)
        fs.unlink(dir, err => console.log(err))

        //delet data
        product.destroy({where : param})
        .then(result =>{
            res.json({
                message: "data has been deleted"
            })
        })
        .catch(error =>{
            res.json({
                message: error.message
            })
        })
    }catch(error){
        res.json({
            message: error.message
        })
    }
})

app.post("/auth", async (req,res) => {
    let data= {
        username: req.body.username,
        password: md5(req.body.password)
    }

    let result = await customer.findOne({where: data})
    if(result){
        let payload = JSON.stringify(result)
        // generate token
        let token = jwt.sign(payload, SECRET_KEY)
        res.json({
            logged: true,
            data: result,
            token: token
        })
    }else{
        res.json({
            logged: false,
            message: "Invalid username or password"
        })
    }
})
module.exports = app