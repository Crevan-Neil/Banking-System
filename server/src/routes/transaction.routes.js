const express=require("express");
const router=express.Router();
const {authMiddleware, authSystemUserMiddleware}=require("../middlewares/auth.middleware");
const {createTransaction, createInitialFundsTransaction}=require("../controllers/transaction.controller")

router.post("/",authMiddleware,createTransaction );
router.post("/system/initial-funds",authSystemUserMiddleware,createInitialFundsTransaction);

module.exports=router;