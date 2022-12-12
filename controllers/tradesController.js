const Trades = require("../models/Trade")
const {encrypt, decrypt } = require('../utils/encrypt-decrypt')

const fetchCompanies = async (req, res) => {
   try {
       const limit = parseInt(req.query.limit);
       const offset = parseInt(req.query.skip);

       const tradesCollection = await Trades.find().skip(offset).limit(limit)
       const tradesCollectionCount = await Trades.count()

       const totalPages = Math.ceil(tradesCollectionCount / limit)
       const currentPage = Math.ceil(tradesCollectionCount % offset)

       res.status(200).send({
           data: tradesCollection,
           paging: {
               total: tradesCollectionCount,
               page: currentPage,
               pages: totalPages
           }
       })
   } catch (error) {
       console.log("Error", error)
       res.status(500).send({data: null})
   }
}

const fetchCompaniesCursor = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit)
        const cursor = req.query.cursor

        let decryptedCursor
        let tradesCollection

        if (cursor) {
            decryptedCursor = decrypt(cursor)
            let decryptedDate = new Date(decryptedCursor * 1000)

            tradesCollection = await Trades.find({
                time: {
                    $lt: new Date(decryptedDate)
                }
            })
                .sort({time: -1})
                .limit(limit + 1)
                .exec()
        } else {
            tradesCollection = await Trades.find({})
                .sort({time: -1})
                .limit(limit + 1)
        }

        const hasMore = tradesCollection.length === limit + 1

        let nextCursor = null

        if (hasMore) {
            const nextCursorRecord = tradesCollection[limit]
            let unixTimestamp = Math.floor(nextCursorRecord.time.getTime() / 1000)

            nextCursor = encrypt(unixTimestamp.toString())
            tradesCollection.pop()
        }

        res.status(200).send({
            data: tradesCollection,
            paging: {
                hasMore,
                nextCursor
            }
        })

    } catch (error) {
        console.log(`Error`, error)
        res.status(500).send({
            data: null,
            error: error
        })
    }
}

module.exports = {
    fetchCompanies,
    fetchCompaniesCursor
}