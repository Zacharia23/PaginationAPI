const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Trades = require('./models/Trade')
const {fetchCompanies, fetchCompaniesCursor} = require('./controllers/tradesController')
const cors = require('cors')
const app = express();

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

if (process.env.NODE_ENV !== "production"){
    require ("dotenv").config({})
}

const PORT = process.env.PORT || 8000
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoose.connection.once("open", () => {
    console.log(`MongoDB Connected!...`)
}).on("error", (error) => {
    console.log("Connection Error: ", error)
})

app.get('/', (req, res) => {
    const random = (Math.random() + 1).toString(36).substring(7)
    console.log(random)
    const trades = new Trades({price:3000, shares: 50,ticker: random, ticket:"Ticket 002",time:Date.now()})
    trades.save().then((trade) => {
        res.status(200).send({
            "message": "Success",
            "code": res.statusCode
        })
    })
    //res.send("Welcome")
})

app.get('/companies', cors(), fetchCompanies)

app.get('/companies-cursor', cors(), fetchCompaniesCursor)


app.listen(PORT, () => {
    console.log(`Server ready at PORT ${PORT}`)
})
