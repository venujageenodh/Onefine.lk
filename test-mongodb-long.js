const { MongoClient } = require('mongodb');
const uri = "mongodb://onefine:onefine@ac-pvhscy0-shard-00-00.qxl1bm4.mongodb.net:27017,ac-pvhscy0-shard-00-01.qxl1bm4.mongodb.net:27017,ac-pvhscy0-shard-00-02.qxl1bm4.mongodb.net:27017/onefine?ssl=true&replicaSet=atlas-pvhscy0-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("Attempting to connect with legacy long-form URI...");
    try {
        await client.connect();
        console.log("SUCCESS! Traditional connection worked.");
        const db = client.db("onefine");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
        console.error("Legacy connection failed too!");
        console.error("Error Message:", err.message);
    } finally {
        await client.close();
    }
}

run();
