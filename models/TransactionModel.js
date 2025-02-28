const mongoose = require("mongoose");
const TransactionSchema = require("../TransactionSchema");

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
