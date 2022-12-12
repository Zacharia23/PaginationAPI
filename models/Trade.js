const Mongoose = require('mongoose')

const tradeSchema = new Mongoose.Schema({
    price: Number,
    shares: Number,
    ticker: String,
    ticket: String,
    time: Date,
})

module.exports = Mongoose.model("trades", tradeSchema)