/* 002-seed-categories.sql */

INSERT INTO categories (name, description, icon)
VALUES 
  ('Museum', 'A place displaying historical or artistic items', 'museum-icon'),
  ('Monument', 'A structure built to commemorate something', 'monument-icon'),
  ('Historical Building', 'A building of historical significance', 'building-icon'),
  ('Art Gallery', 'A place to exhibit art', 'gallery-icon'),
  ('Theater', 'A venue for performing arts', 'theater-icon'),
  ('Library', 'A place to borrow and read books', 'library-icon'),
  ('Religious Site', 'A site used for religious purposes', 'religious-icon'),
  ('Cultural Center', 'A venue for cultural events and education', 'culture-icon'),
  ('Restaurants', 'A place where meals are prepared and served to customers', 'culture-icon')
ON CONFLICT (name) DO NOTHING;
