const express = require('express');
const path = require('path');
const cors = require('cors');
const performanceCalculator = require('./performance-calculator.js');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.json());


// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 