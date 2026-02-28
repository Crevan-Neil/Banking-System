const app=require("./src/app");

require("dotenv").config();
const connectToDB=require("./src/config/db");
connectToDB();
app.listen(5000,()=>{
    console.log("server is running on port 5000");
})