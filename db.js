const { MongoClient } = require('mongodb')
require('dotenv').config();

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(process.env.DB_STRING)
            .then(client => {
                dbConnection = client.db()
                return cb()
            })
            .catch(err => {
                console.log(err)
                return cb(err)
            })
    },
    getDb: () => dbConnection
}