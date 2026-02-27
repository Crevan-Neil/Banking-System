const express=require("express");
const authRouter=require("./routes/auth.routes");
const accountRouter=require("./routes/account.routes");
const transactionRouter=require("./routes/transaction.routes");
const cookie=require("cookie-parser");
const app=express();


app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transactions", transactionRouter);


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookie());


module.exports=app;