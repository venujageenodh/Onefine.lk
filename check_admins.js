const mongoose = require('mongoose');
const AdminUser = require('./server/models/AdminUser');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/onefine';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const admins = await AdminUser.find();
        console.log('Admins found:', admins.map(a => ({ name: a.name, email: a.email, role: a.role })));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
