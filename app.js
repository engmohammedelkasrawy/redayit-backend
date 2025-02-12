require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT =  process.env.PORT || 3000;

// Load Environment Variables
const APP_NAME = process.env.APP_NAME || 'Redayit';
const ENV = process.env.NODE_ENV || 'dev';
const DB_HOST = process.env.DB_HOST || 'mongodb';
const DB_PORT = process.env.DB_PORT || '27017';
const DB_NAME = `${APP_NAME.toLowerCase()}_${ENV}`;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const COLLECTION_NAME = `${APP_NAME.toLowerCase()}_${ENV}_todos`;

// Enable CORS for React app
app.use(cors({ origin: 'http://localhost:3001' })); // Make sure this matches your React app URL
// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`Connected to MongoDB: Database "${DB_NAME}"`))
    .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema & Model
const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
});
const Todo = mongoose.model(COLLECTION_NAME, todoSchema);

// API Routes
app.get(`/api/${COLLECTION_NAME}`, async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});

app.post(`/api/${COLLECTION_NAME}`, async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Task title is required' });
    }

    const newTodo = new Todo({
        title,
        description,
    });

    try {
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
});

app.put(`/api/${COLLECTION_NAME}/:id`, async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { completed: req.body.completed },
            { new: true }
        );
        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
});

app.delete(`/api/${COLLECTION_NAME}/:id`, async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Redayit V6 App!');
});

// Start Server
app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server running on http://localhost:${PORT} for environment: ${ENV}`);
});
