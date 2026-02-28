const accountModel=require("../models/account.model");
const transactionModel=require("../models/transaction.model");
const ledgerModel=require("../models/ledger.model");
const emailService=require("../services/email.service");
const mongoose=require("mongoose");

module.exports.createTransaction=async function(req,res){
    const {fromAccount, toAccount, amount, idempotencyKey}=req.body;
    if(!fromAccount || !toAccount ||  !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount, toAccount, amount and idempotencyKey are required "
        })
    }
    let fromUserAccount=await accountModel.findOne({id:fromAccount});
    let toUserAccount=await accountModel.findOne({_id:toAccount});
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }
    let isTransactionAlreadyExists=await transactionModel.findOne({ idempotencyKey});
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status=="COMPLETED"){
            return res.status(200).json({
                message:"Transaction is already processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status=="PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing"            })
        }
        if(isTransactionAlreadyExists.status=="FAILED"){
            return res.status(500).json({
                mesage: "Previous transaction failed, please try again"
            })
        }
        if(isTransactionAlreadyExists.status=="REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed please retry"
            })
        }
    }
    if(fromUserAccount.status!=="ACTIVE" ||  toUserAccount.status!=="ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    const balance =fromUserAccount.getBalance();
    if(balance<amount){
        return res.status(400).json({
            message:`Balance is insufficient. Current balance is ${balance}.Requested amount is ${amount}`
        })
    }
    let transaction;
    try{
        const session=await mongoose.session();
        session.startTransaction();
        transaction=(await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session}))[0]
        const debitLedgerEntry=await ledgerModel.create([{
            account:fromAccount,
            type:"DEBIT",
            amount:amount,
            transaction:transaction._id
        }],{session})

        await (()=>{
            return new Promise((resolve)=> setTimeout(resolve,100*1000));
        }) ()

        const creditLedgerEntry=await ledgerModel.create([{
            account:toAccount,
            type:"CREDIT",
            amount:amount,
            transaction:transaction._id
        }],{session})
        transaction.status="COMPLETED";



        await transactionModel.findOneAndUpdate({
            _id:transaction._id,
            status:"COMPLETED"
        },{session})

        await session.commitTransaction();
        session.endSession();
    }
    catch(error){
        return res.status(400).json({
            message:"Transaction is Pending due to some issue, please retry after sometime"
        })
    }


    await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount);
    return res.status(201).json({
        message:"Transaction completed successfully",
        transaction:transaction
    })
}

module.exports.createInitialFundsTransaction=async function(req,res){
    const{toAccount, amount, idempotencyKey}=req.body;
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount, amount and idempotencyKey are required"
        })
    }
    let toUserAccount=await accountModel.findOne({_id:toAccount});
    if(!toUserAccount){
        return res.status(400).json({
            message:"toAccount does not exist"
        })
    }
    const fromUserAccount=await accountModel.findOne({
        user:req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user account not found"
        })
    }
    if(toUserAccount.status!=="ACTIVE" || fromUserAccount.status!=="ACTIVE"){
        return res.status(400).json({
            message:"toAccount needs to be ACTIVE"
        })
    }
    const session=mongoose.startSession();
    await session.startTransaction;
    const transaction=new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        status:"PENDING",
        amount,
        idempotencyKey
    })
    const debitLedgerEntry=await ledgerModel.create([{
        account:fromUserAccount._id,
        type:"DEBIT",
        amount,
        transaction:transaction._id
    }],{session})
    const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        type:"CREDIT",
        amount,
        transaction:transaction._id
    }],{session})
    transaction.status="COMPLETED";
    await transaction.save({session});
    await session.commitTransaction();
    await session.endSession();
    return res.status(201).json({
        message:"Initial funds transaction completed successfully",
        transaction:transaction
    })
}