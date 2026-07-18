require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// --- PLACEMENT: Put it here, before your routes ---
// This tells Express to serve static files (like index.html) 
// from the current folder ('.')
app.use(express.static('public'));

// Configure S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Routes
app.post('/upload', upload.single('myFile'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}_${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        res.send('File uploaded successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Upload failed.');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));