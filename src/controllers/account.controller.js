const accountModel=require("../models/account.model");

module.exports.createAccountController=async (req,res)=>{
    let user=req.user;
    const account=await accountModel.create({
        user:user._id
    })
    res.status(201).json({
        account
    })

}

module.exports.getUserController=async function(req,res){
    const account=await accountModel.findOne({
        user:req.user._id
    })
    res.status(201).json({
        account
    })
}

module.exports.getAccountBalanceController=async function(req,res){
    const {accountId}=req.params;
    let account=await accountModel.findOne({
        _id:accountId,
        user:req.user._id
    })
    if(!account){
        return res.status(404).json({
            message: "Account not found"
        })
    }
    let balance=await account.getBalance();
    return res.status(200).json({
        accountId:account._id,
        balance:balance
    })
}

