const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const mongoose = require('mongoose');
const AdminUser = require('./server/models/AdminUser');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onefine';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const admins = await AdminUser.find();
        console.log('Admins found:', JSON.stringify(admins.map(a => ({ name: a.name, email: a.email, role: a.role }))));
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err.message);
        process.exit(1);
    });
