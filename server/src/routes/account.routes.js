const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { createAccountController, getUserController, getAccountBalanceController } = require("../controllers/account.controller");
const router = express.Router();


router.post("/", authMiddleware, createAccountController);
router.get("/", authMiddleware, getUserController);
router.get("/balance/:accountId", authMiddleware, getAccountBalanceController);

module.exports = router;