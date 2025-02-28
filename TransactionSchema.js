const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Transaction Schema
const TransactionSchema = new Schema({
    transaction: {
        type: String,
        enum: ["Card Withdraw", "Cash Payment", "Bill Payment", "Bank Transfer"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
    },
    cardholder: {
        type: String,
        required: true,
        trim: true,
    },
    bank: {
        type: String,
        required: true,
        trim: true,
    },
    cardNumber: {
        type: String,
        required: true,
        match: [/^\d{4}$/, "Card Number should be the last 4 digits"],
    },
    expiry: {
        type: String,
        required: true,
        match: [/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"],
    },
    cardType: {
        type: String,
        enum: ["Visa (1.8%)", "HDFC Visa (2.5%)", "MasterCard (2.9%)", "AMEX (2.5%)"],
        required: true,
    },
    contributor: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
    }
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

module.exports = TransactionModel;