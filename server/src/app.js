const express=require("express");
const authRouter=require("./routes/auth.routes");
const accountRouter=require("./routes/account.routes");
const transactionRouter=require("./routes/transaction.routes");
const cookie=require("cookie-parser");
const cors=require("cors");
const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookie());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://banking-system-1-muxn.onrender.com"
  ],
  credentials: true
}));

app.get("/", (req, res) => {
  res.status(200).send("Backend is live 🚀");
});
app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transactions", transactionRouter);


app.get("/test", (req, res) => {
  res.send("Backend working");
});


module.exports=app;