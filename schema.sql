-- Roman Command Database Schema
-- Run this to set up all tables

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default businesses
INSERT INTO businesses (key, name, color, description) VALUES
  ('nature', 'Nature Properties', '#27ae60', 'Long-term rental portfolio via Stessa'),
  ('padsplit', '4608 PadSplit', '#2980b9', 'Room rental conversion at 4608'),
  ('airbnb', 'Airbnb', '#8e44ad', 'Short-term rental unit'),
  ('personal', 'Personal', '#e67e22', 'Personal appointments and tasks')
ON CONFLICT (key) DO NOTHING;

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  trade VARCHAR(100),
  notes TEXT,
  rating VARCHAR(50),
  last_used_date DATE,
  last_used_property VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default contacts
INSERT INTO contacts (name, phone, trade, rating, last_used_property, last_used_date) VALUES
  ('Marco Garcia', '6155550142', 'Drywall · General', 'Reliable · On time', '4608', '2025-11-01'),
  ('Rivera Plumbing', '6155550198', 'Plumbing', 'Fast response', 'Unit 7', '2026-01-01'),
  ('TN Electric Co.', '6155550277', 'Electrical', 'Runs a bit late', 'Airbnb', '2026-02-01');

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  business_key VARCHAR(50) REFERENCES businesses(key),
  date DATE NOT NULL,
  time_block VARCHAR(50) NOT NULL,
  exact_time VARCHAR(50),
  contact_id INTEGER REFERENCES contacts(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  business_key VARCHAR(50) REFERENCES businesses(key),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  due_date DATE,
  notes TEXT,
  assigned_to VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tasks
INSERT INTO tasks (title, business_key, priority, status, due_date) VALUES
  ('Get drywall estimate signed off', 'padsplit', 'high', 'open', '2026-03-30'),
  ('Follow up — late rent Unit 3', 'nature', 'high', 'open', '2026-03-29'),
  ('Review Airbnb pricing for April', 'airbnb', 'medium', 'open', '2026-04-01'),
  ('Research PadSplit onboarding docs', 'padsplit', 'low', 'open', '2026-04-05');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (name, email, role) VALUES
  ('Roman', 'roman@romancommand.com', 'owner'),
  ('Assistant', 'assistant@romancommand.com', 'assistant')
ON CONFLICT (email) DO NOTHING;
