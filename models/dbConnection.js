const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/myDataBase')
        console.log("Connected to mongodb");
    }catch(err){
        console.log("err--->" , err)
    }
}

module.exports = connectDB;