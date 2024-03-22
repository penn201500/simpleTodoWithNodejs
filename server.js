"use strict";

let express = require("express")
let path = require('path')
const { MongoClient, ServerApiVersion } = require('mongodb');
let ourApp = express()
let username = ""
let password = ""
let dbName = "TodoApp"
let listeningPort = 3000
const uri = `mongodb+srv://${username}:${password}@cluster0.pmdaunw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
let db

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db(dbName).command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        db = client.db(dbName)
        ourApp.listen(listeningPort)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

ourApp.use(express.urlencoded({extended: false}))

ourApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'todo.html'))
})

ourApp.get('/about', (req, res) => {
    res.end('hello, this is about page')
})

ourApp.post('/createItem', async (req, res) => {
        let itemValue = req.body.item;
        await db.collection('items').insertOne({text: itemValue})
        console.log(console.log('itemValue: ', itemValue))
        res.send(`
    <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
        <span class="item-text">${itemValue}</span>
        <div>
            <button class="edit-me btn btn-secondary btn-sm me-1">Edit</button>
            <button class="delete-me btn btn-danger btn-sm">Delete</button>
        </div>
    </li>
    `)
    }
)

ourApp.use((req, res) => {
    res.status(404).send('we cannot find the page you are looking for')

})
