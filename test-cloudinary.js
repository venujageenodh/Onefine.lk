const cloudinary = require('./node_modules/cloudinary').v2;
require('dotenv').config({ path: './.env' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test actual upload_stream with a small fake image buffer
const { Readable } = require('stream');

// Create a minimal valid 1x1 PNG buffer
const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

console.log('Testing upload_stream...');
const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'onefine-test', resource_type: 'image' },
    (error, result) => {
        if (error) {
            console.error('UPLOAD ERROR:', error.message || JSON.stringify(error));
            console.error('HTTP Status:', error.http_code);
            console.error('Full error:', JSON.stringify(error, null, 2));
        } else {
            console.log('UPLOAD SUCCESS:', result.secure_url);
        }
    }
);

uploadStream.end(pngBuffer);
