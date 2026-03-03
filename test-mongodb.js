const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://onefine:onefine@onefine.qxl1bm4.mongodb.net/onefine";

async function run() {
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("Attempting to connect to MongoDB Atlas...");
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");
        const db = client.db("onefine");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
        console.error("Connection failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.reason) {
            console.error("Reason:", JSON.stringify(err.reason, null, 2));
        }
    } finally {
        await client.close();
    }
}

run();
