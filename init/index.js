//We are writing the code for initialization of the database (how data.js will be saved in the database)
const mongoose = require("mongoose");
const initData= require("./data.js");
const TransactionModel = require("../TransactionSchema.js");

//DATABASE CONNECTION SETUP 
const MONGO_URL="mongodb://127.0.0.1:27017/instamudraa";

async function main(){
    await mongoose.connect(MONGO_URL);
}

//CALLING THE main() function
main()
    .then(()=>{
        console.log("connected to DataBase.");
    })
    .catch((err)=>{
        console.log(err);
    });


//SAVING THE DATA inside the data.js INTO THE DATABSE

const initDB= async ()=>{
    console.log("Initializing Data:", initData.data); // Debugging line
    await TransactionModel.deleteMany({});
    await TransactionModel.insertMany(initData.data);
    console.log("data is initialized.");
}

initDB();
