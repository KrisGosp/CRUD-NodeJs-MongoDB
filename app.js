// const { application } = require('express');
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

require('dotenv').config();

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

// Auth0 Implementation
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: 'http://localhost:1111',
  clientID: 'n9qmceKv31NNIvHJuGATgRwukoGgIeRe',
  issuerBaseURL: 'https://firstauth0.eu.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// user profile information
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});


//routes 
app.get('/books', (req, res) => {
    // the current page query parameter
    const page = req.query.p || 0; // the same as we named it
    const booksPerPage = 2; // usually should be around 20
    let books = [];

    db.collection('books')
        .find()
        .sort({ author: 1 })
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch documents'})
        })
});

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