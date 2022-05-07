const express = require('express');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const { connectToDb, getDb } = require('./db');
const app = express();

let db;
connectToDb((err) => {
    if(!err) {
        app.listen(1111, () => {
            console.log('listening on port 1111')
        })
        db = getDb();
    }
})

//routes 
app.get('/books', (req, res) => {

    let books = [];

    db.collection('books')
        .find()
        .sort({ author: 1 })
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch documents'})
        })
});

// app.get('/', (req, res) => {
//     db.collection('books')
//     .insertOne({
//         title: "All About Me",
//         author: "Marshall Metkins",
//         pages: 100,
//         genres: [ "rap", "coding" ],
//         rating: 7
//     })
//     .then(() => {
//         res.status(200).json({msg: 'added'})
//     })
// })

app.get('/books/:id', (req, res) => {
    db.collection('books')
    .findOne({_id: ObjectId(req.params.id)})
    .then(doc => {
        res.status(200).json(doc)
    })
    .catch(() => {
        res.status(500).json({ error: 'Could not fetch documents'})
    })
})