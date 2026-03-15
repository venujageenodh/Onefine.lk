const jwt = require('jsonwebtoken');
const JWT_SECRET = 'onefine_jwt_secret_change_in_production'; // From server/.env

// Generate a legacy admin token
const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
console.log(token);
