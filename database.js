const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const userName = process.env.DB_USERNAME;
const password = encodeURIComponent(process.env.DB_PASSWORD);
const dbHost = process.env.DB_HOST;
const appName = process.env.APP_NAME;
const dbCollection = process.env.DB_COLLECTION;
const dbName = process.env.DB_NAME;
const uri = `mongodb+srv://${userName}:${password}@${dbHost}/?retryWrites=true&w=majority&appName=${appName}`;
const logger = require("./logger");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

async function connectToDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        logger.info("Successfully connected to MongoDB.");
    } catch (e) {
        logger.error("Error connecting to MongoDB: ", e);
        throw e;
    }
}

async function getDB() {
    if (!db) {
        await connectToDB();
    }
    return db;
}


async function getCollection() {
    if (!db) {
        await connectToDB();
    }
    return db.collection(dbCollection);
}

async function closeDBConnection() {
    try {
        await client.close();
        logger.info("MongoDB connection closed.");
    } catch (e) {
        logger.error("Error closing MongoDB connection: ", e);
        throw e;
    }
}

async function isConnected() {
    try {
        // Attempt to fetch the server status. This command requires an active connection.
        const adminDb = client.db("admin");
        await adminDb.command({ping: 1});
        logger.info("Database connection is active.");
        return true; // The command succeeded, so the connection is active
    } catch (e) {
        logger.error("Database connection is not active: ", e);
        return false; // The command failed, so the connection is likely not active
    }
}

module.exports = {
    isConnected,
    connectToDB,
    getDB,
    getCollection,
    closeDBConnection
};