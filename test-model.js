const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const Quotation = require('./server/models/Quotation');

async function test() {
    try {
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');
        
        const count = await Quotation.countDocuments({});
        console.log('Count:', count);
        
        const data = await Quotation.find({}).limit(1);
        console.log('Sample data:', JSON.stringify(data, null, 2));
        
        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e);
        process.exit(1);
    }
}

test();
