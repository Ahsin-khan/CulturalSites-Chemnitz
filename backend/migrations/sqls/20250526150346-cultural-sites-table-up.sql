/*
  # Cultural Sites Table Migration
*/

CREATE TABLE IF NOT EXISTS cultural_sites (
  id SERIAL PRIMARY KEY,
  osm_id BIGINT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address JSONB,
  opening_hours VARCHAR(255),
  website VARCHAR(255),
  phone VARCHAR(50),
  tags JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
