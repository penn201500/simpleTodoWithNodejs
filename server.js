"use strict";

let express = require("express");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
let ourApp = express();
let userName = process.env.DB_USERNAME;
let password = encodeURIComponent(process.env.DB_PASSWORD);
let dbHost = process.env.DB_HOST;
let appName = process.env.APP_NAME;
let dbCollection = process.env.DB_COLLECTION;
let dbName = "TodoApp";
let listeningPort = 3000;
const uri = `mongodb+srv://${userName}:${password}@${dbHost}/?retryWrites=true&w=majority&appName=${appName}`;
let db;
const logger = require("./logger");


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
        logger.info("Pinged your deployment. You successfully connected to MongoDB!")
        ourApp.listen(listeningPort, () => {
            logger.info(`server is running on port ${listeningPort}`)
        });
    } catch (e) {
        logger.error(e)
        await client.close(); // ensure the client closes on error
        process.exit(1); // exit with a failure code
    }
}

//TODO: how to output log info into a file
run().catch(async (e) => {
        logger.error(e)
        await client.close();
        process.exit(1);
    }
);


// middleware
ourApp.use(passwordProtected);
ourApp.use(express.urlencoded({extended: false}));
ourApp.use(express.static("public"));
ourApp.use(express.json());

function passwordProtected(req, res, next) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Basic ")) {
        const base64Credentials = auth.split(" ")[1];
        const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
        const [username, password] = credentials.split(":");
        if (username === "test" && password === "test") {
            return next();
        }
    }

    res.set("WWW-Authenticate", "Basic realm=\"Simple Todo App\"");
    res.status(401).send("Authentication required");
}

ourApp.get("/", async (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// get items
ourApp.get("/get-items", async (req, res) => {
    try {
        const items = await db.collection(dbCollection).find().toArray();
        res.json(items);
    } catch (e) {
        logger.error(e)
        res.status(500).send("Error fetching items");
    }
});

ourApp.get("/about", (req, res) => {
    res.end("hello, this is about page");
});

ourApp.post("/create-item", async (req, res) => {
        let itemValue = req.body.text;
        let info = await db.collection(dbCollection).insertOne({text: itemValue});
        res.json({text: itemValue, _id: info.insertedId});
        logger.info(`Created an item ${info.insertedId}`);
    }
);

ourApp.post("/update-item", async (req, res) => {
    let itemValue = req.body.text;
    let itemID = new ObjectId(req.body.id)
    await db.collection(dbCollection).findOneAndUpdate({_id: itemID}, {$set: {text: itemValue}});
    res.send("success");
    logger.info(`Updated an item ${itemID}`);
});

ourApp.post("/delete-item", async (req, res) => {
    let itemID = new ObjectId(req.body.id)
    await db.collection(dbCollection).deleteOne({_id: itemID});
    res.send("success");
    logger.info(`Deleted an item ${itemID}`);
});
ourApp.use((req, res) => {
    res.status(404).send("we cannot find the page you are looking for");
});

// close the MongoDB connection when the Node.js process ends
process.on("SIGINT", async () => {
        logger.info("Closing MongoDB connection due to app termination");
        await client.close();
        process.exit(0);
    }
);

process.on("SIGTERM", async () => {
        logger.info("Closing MongoDB connection due to app normal termination");
        await client.close();
        process.exit(0);
    }
);
