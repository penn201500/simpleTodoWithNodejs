"use strict";

const express = require("express");
const {ObjectId} = require("mongodb");
const {connectToDB, getCollection, closeDBConnection} = require("./database");
const logger = require("./logger");
const sanitizeHTML = require("sanitize-html");

const ourApp = express();
const listeningPort = 3000;

let dbCollection;

async function run() {
    try {
        await connectToDB();
        dbCollection = await getCollection();
        ourApp.listen(listeningPort, () => {
            logger.info(`server is running on port ${listeningPort}`);
        });
    } catch (e) {
        logger.error(e);
        await closeDBConnection(); // Ensure closing the database connection on error
        process.exit(1); // exit with a failure code
    }
}

run().catch(async (e) => {
        logger.error(e);
        await closeDBConnection();
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
        const items = await dbCollection.find().toArray();
        res.json(items);
    } catch (e) {
        logger.error(e);
        res.status(500).send("Error fetching items");
    }
});

ourApp.get("/about", (req, res) => {
    res.end("hello, this is about page");
});

ourApp.post("/create-item", async (req, res) => {
        let itemValue = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}});
        let info = await dbCollection.insertOne({text: itemValue});
        res.json({text: itemValue, _id: info.insertedId});
        logger.info(`Created an item ${info.insertedId}`);
    }
);

ourApp.post("/update-item", async (req, res) => {
    let itemValue = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}});
    let itemID = new ObjectId(req.body.id);
    await dbCollection.findOneAndUpdate({_id: itemID}, {$set: {text: itemValue}});
    res.send("success");
    logger.info(`Updated an item ${itemID}`);
});

ourApp.post("/delete-item", async (req, res) => {
    let itemID = new ObjectId(req.body.id);
    await dbCollection.deleteOne({_id: itemID});
    res.send("success");
    logger.info(`Deleted an item ${itemID}`);
});
ourApp.use((req, res) => {
    res.status(404).send("we cannot find the page you are looking for");
});

// close the MongoDB connection when the Node.js process ends
process.on("SIGINT", async () => {
        logger.info("Closing MongoDB connection due to app termination");
        await closeDBConnection();
        process.exit(0);
    }
);

process.on("SIGTERM", async () => {
        logger.info("Closing MongoDB connection due to app normal termination");
        await closeDBConnection();
        process.exit(0);
    }
);
