//import express
const express = require("express")
const app = express()
app.use(express.json())

//import model
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi
const product = models.product
//import auth
// const auth = require("../auth")
// app.use(auth)

//endpoint menampilkan selurh data 
app.get("/",async (req,res) =>{
    let result =await transaksi.findAll({
        include: [
            "customer",{
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["product"]
            }
        ]
    })
    res.json(result)
})

//endpoint tampil berdasar id
app.get("/:customer_id", async (req, res) =>{
    let param = { customer_id: req.params.customer_id}
    let result = await transaksi.findAll({
        where: param,
        include: [
            "customer",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["product"]
            }
        ]
    })
    res.json(result)
})

//endpoint menambahkan data baru, POST
app.post("/", async(req,res) =>{
    let current = new Date().toISOString().split('T')[0]
    let data ={
        customer_id: req.body.customer_id,
        waktu: current
    }
    transaksi.create(data)
    .then(result => {
        let lastID = result.transaksi_id,
         detail = req.body.detail_transaksi
         detail.forEach(element => {
            element.transaksi_id = lastID
        });
        console.log(detail_transaksi)
        let idProduct = {product_id: detail[0].product_id};
        product
        .findOne({where : idProduct})
        .then(result =>{
            let stocknow = result.stock;
            let newStock = {stock: stocknow - detail[0].qty};
            product.update(newStock , {where: idProduct});
        })      
    detail_transaksi.bulkCreate(detail)
    res.json({
        message: "data masuk"
    })
        .catch(error =>{
            res.json({
                message:error.message
            })
        })
    })
    .catch(error =>{
        console.log(error.message);
    })
})
//endpoint menghapus data
app.delete("/:transaksi_id", async(req,res) => {
    let param = {transaksi_id: req.params.transaksi_id}
    try {
        await detail_transaksi.destroy({where: param})
        await transaksi.destroy({where: param})
        res.json({
            message : "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }

})
module.exports = app