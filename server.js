const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database tables
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        business VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        time_block VARCHAR(50) NOT NULL,
        exact_time VARCHAR(50),
        contact VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        trade VARCHAR(100),
        notes TEXT,
        rating VARCHAR(100),
        last_used VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        business VARCHAR(100),
        priority VARCHAR(50),
        status VARCHAR(50) DEFAULT 'open',
        due_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default contacts if empty
    const contactCheck = await pool.query('SELECT COUNT(*) FROM contacts');
    if (parseInt(contactCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO contacts (name, phone, trade, rating, last_used) VALUES
        ('Marco Garcia', '6155550142', 'Drywall / General', 'Reliable · On time', '4608 — Nov 2025'),
        ('Rivera Plumbing', '6155550198', 'Plumbing', 'Fast response', 'Unit 7 — Jan 2026'),
        ('TN Electric Co.', '6155550277', 'Electrical', 'Runs a bit late', 'Airbnb — Feb 2026');
      `);
    }

    // Seed default events if empty
    const eventCheck = await pool.query('SELECT COUNT(*) FROM events');
    if (parseInt(eventCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO events (title, business, date, time_block, contact, notes) VALUES
        ('Subcontractor Estimate — Drywall', 'padsplit', '2026-03-30', 'allday', 'Marco Garcia', ''),
        ('Rent Collection Review', 'nature', '2026-03-30', 'morning', '', ''),
        ('Airbnb Turnover — Unit B', 'airbnb', '2026-03-30', 'afternoon', '', 'Cleaning crew confirmed'),
        ('PadSplit Room Inspection', 'padsplit', '2026-04-01', 'morning', '', ''),
        ('Mortgage Payment Due', 'nature', '2026-04-01', 'allday', '', ''),
        ('Airbnb Guest Check-in', 'airbnb', '2026-04-04', 'afternoon', '', '3-night stay'),
        ('Plumbing Repair — Unit 7', 'nature', '2026-04-02', 'morning', 'Rivera Plumbing', 'Leaking faucet'),
        ('Weekly Ops Review', 'personal', '2026-04-03', 'morning', '', '');
      `);
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDatabase();

// ===== EVENT ROUTES =====

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC, time_block ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get events by date range
app.get('/api/events/range', async (req, res) => {
  const { start, end } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE date >= $1 AND date <= $2 ORDER BY date ASC',
      [start, end]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new event
app.post('/api/events', async (req, res) => {
  const { title, business, date, time_block, exact_time, contact, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO events (title, business, date, time_block, exact_time, contact, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, business, date, time_block, exact_time || null, contact || '', notes || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event notes
app.patch('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE events SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [notes, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CONTACT ROUTES =====

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new contact
app.post('/api/contacts', async (req, res) => {
  const { name, phone, email, trade, notes, rating, last_used } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO contacts (name, phone, email, trade, notes, rating, last_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone || '', email || '', trade || '', notes || '', rating || '', last_used || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TASK ROUTES =====

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
  const { title, business, priority, due_date, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, business, priority, due_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, business || '', priority || 'normal', due_date || null, notes || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Roman Command backend is running', timestamp: new Date() });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Roman Command backend running on port ${port}`);
});
