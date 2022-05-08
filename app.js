const { application } = require('express');
const express = require('express');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const { connectToDb, getDb } = require('./db');

const app = express();
app.use(express.json());

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

    if (ObjectId.isValid(req.params.id)) { // check if the id is valid so we dont get BSON errors

    db.collection('books')
        .findOne({_id: ObjectId(req.params.id)})
        .then(doc => {
            res.status(200).json(doc)
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch documents'})
        })
    } else {
        res.status(500).json({ error: 'Not a valid id'})
    }
    // IF THE ID IS VALID BUT IS NOT MATCHING ANY IN THE DB, null IS RETURNED
    // TO DO !!! HANDLE null
})

app.post('/books', (req, res) => {
    const book = req.body;

    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({err: 'could not create a new document'})
        })
})

app.delete('/books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
        .deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({err: 'could not delete the document'})
        })
    } else {
        res.status(500).json({err: 'no such document id'})
    }
})

app.patch('/books/:id', (req, res) => {
    const updates = req.body;

    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .updateOne({_id: ObjectId(req.params.id)}, {$set: updates})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({err: 'could not update the document'})
            })
        } else {
            res.status(500).json({err: 'no such document id'})
        }
})