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

ourApp.use(express.urlencoded({extended: false}))
ourApp.use(express.static('public'))
ourApp.use(express.json())

ourApp.get('/', async (req, res) => {
    const items = await db.collection(dbCollection).find().toArray((err, result) => {
        if (err) return console.log(err)
    })
    res.send(`
   <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple To-Do App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<body>
<div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>

    <div class="jumbotron p-3 shadow-sm">
        <form id="form" method="POST">
            <div class="d-flex align-items-center">
                <input id="input-field" name="item" placeholder="Enter New To-Do" autofocus autocomplete="off" class="form-control me-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
            </div>
        </form>
    </div>

    <ul id="item-list" class="list-group pb-5">
    </ul>
</div>

<script>
let items = ${JSON.stringify(items)}
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
<script src="https://unpkg.com/axios@1.6.7/dist/axios.min.js"></script>
<script src="/todo.js"></script>
</body>
</html> 
    `)
})

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
