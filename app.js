// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Database connected!');
});

// Sample route
app.get('/', (req, res) => {
    res.send('Hello, welcome to TrustChain!');
});

// User registration route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');

        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) return res.status(500).send('Database error');
            res.send('User registered successfully');
        });
    });
});

// User login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).send('Database error');
        if (results.length === 0) return res.status(400).send('User not found');

        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).send('Error comparing passwords');
            if (!isMatch) return res.status(400).send('Invalid credentials');

            res.send('Login successful');
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
