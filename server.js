const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===== EVENTS =====

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC, time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Add new event
app.post('/api/events', async (req, res) => {
  const { title, biz, date, time, contact, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO events (title, biz, date, time, contact, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, biz, date, time, contact, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// Update event notes
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET notes=$1 WHERE id=$2 RETURNING *',
      [notes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM events WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ===== CONTACTS =====

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Add contact
app.post('/api/contacts', async (req, res) => {
  const { name, trade, phone, last_used, rating, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, trade, phone, last_used, rating, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, trade, phone, last_used, rating, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

// ===== TASKS =====

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add task
app.post('/api/tasks', async (req, res) => {
  const { title, biz, due_date, priority, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, biz, due_date, priority, notes, done) VALUES ($1,$2,$3,$4,$5,false) RETURNING *',
      [title, biz, due_date, priority, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Toggle task done
app.put('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tasks SET done = NOT done WHERE id=$1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Roman Command API running', version: '0.2' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Roman Command server running on port ${PORT}`);
});
