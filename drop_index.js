const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in server/.env');
    process.exit(1);
}

async function dropIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const collection = mongoose.connection.collection('orders');
        
        console.log('Listing indexes...');
        const indexes = await collection.indexes();
        console.log(indexes);
        
        if (indexes.find(idx => idx.name === 'orderId_1')) {
            console.log('Dropping index orderId_1...');
            await collection.dropIndex('orderId_1');
            console.log('✅ Index dropped');
        } else {
            console.log('Index orderId_1 not found');
        }
        
    } catch (err) {
        console.error('❌ Error dropping index:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

dropIndex();
