/*
  # Site Categories Table Migration

*/

CREATE TABLE IF NOT EXISTS site_categories (
  id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES cultural_sites(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure a site can only be in a specific category once
  UNIQUE(site_id, category_id)
);
