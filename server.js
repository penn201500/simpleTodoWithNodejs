"use strict";

let express = require("express")
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config()
let ourApp = express()
let userName = process.env.DB_USERNAME
let password = encodeURIComponent(process.env.DB_PASSWORD)
let dbHost = process.env.DB_HOST
let appName = process.env.APP_NAME
let dbCollection = process.env.DB_COLLECTION
let dbName = "TodoApp"
let listeningPort = 3000
const uri = `mongodb+srv://${userName}:${password}@${dbHost}/?retryWrites=true&w=majority&appName=${appName}`;
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
        await client.db(dbName).command({ping: 1});
        db = await client.db(dbName);
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        ourApp.listen(listeningPort, () => {
            console.log(`server is running on port ${listeningPort}`)
        })
    } catch (e) {
        console.error(e);
    }
}

//TODO: how to output log info into a file
run().catch(console.dir);


// middleware
ourApp.use(express.urlencoded({extended: false}))
ourApp.use(express.static('public'))
ourApp.use(express.json())

ourApp.get('/', async (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

// get items
ourApp.get('/get-items', async (req, res) => {
    try {
        const items = await db.collection(dbCollection).find().toArray();
        res.json(items);
    } catch (e) {
        console.log(e);
        res.status(500).send("Error fetching items");
    }
});

ourApp.get('/about', (req, res) => {
    res.end('hello, this is about page')
})

ourApp.post('/create-item', async (req, res) => {
        let itemValue = req.body.text;
        let info = await db.collection(dbCollection).insertOne({text: itemValue})
        res.json({text: itemValue, _id: info.insertedId})
    }
)

ourApp.post('/update-item', async (req, res) => {
    let itemValue = req.body.text;
    await db.collection(dbCollection).findOneAndUpdate({_id: new ObjectId(req.body.id)}, {$set: {text: itemValue}})
    res.send('success')
})

ourApp.post('/delete-item', async (req, res) => {
    await db.collection(dbCollection).deleteOne({_id: new ObjectId(req.body.id)})
    res.send('success')
})
ourApp.use((req, res) => {
    res.status(404).send('we cannot find the page you are looking for')
})
