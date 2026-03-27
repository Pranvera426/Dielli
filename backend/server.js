const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up static dir for uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Routes
const calculatorRoutes = require('./routes/calculator');
const contactRoutes = require('./routes/contact');

app.use('/api/calculator', calculatorRoutes);
app.use('/api/contact', contactRoutes);

// Companies API
app.get('/api/companies', (req, res) => {
    try {
        const companies = require('./data/companies.json');
        res.json(companies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load companies.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
