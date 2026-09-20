# CulturaMap Chemnitz

An interactive web application to explore and review cultural heritage sites in Chemnitz, Germany. This platform combines OpenStreetMap data, modern web technologies, and user-generated content to enhance cultural awareness and provide a personalized exploration experience.

## Project Structure
CulturaSites Chemnitz/ 

    ├── frontend/ → Angular SPA

    ├── backend/ → Node.js REST API


## Technologies Used

| Area        | Technology                   |
| ----------- | ---------------------------- |
| Frontend    | Angular 19, TypeScript, CSS  |
| Maps        | Leaflet.js, OpenStreetMap    |
| Backend     | Node.js, Express, TypeScript |
| Auth        | JWT (JSON Web Tokens)        |
| Database    | PostgreSQL + pg-migrate      |

## Getting Started

### Prerequisites
- Node.js & npm
- Angular CLI
- PostgreSQL

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahsin-khan/CulturalSites-Chemnitz.git
   cd CulturalSites-Chemnitz

2. **Backend Setup**
   ```bash
    cd backend
    npm install
    npm run start

3. **Frontend Setup**
   ```bash
    cd frontend
    npm install
    ng serve

    For production build: npm run build

## Environment Variables
Create a .env file in the backend/ folder with the following keys:

- POSTGRES_HOST=127.0.0.1
- POSTGRES_DB=cultural_sites_dev
- POSTGRES_USER=your_db_user
- POSTGRES_PASSWORD=your_password
- ENV=dev
- BCRYPT_PASSWORD=your_bcrypt_password
- SALT_ROUNDS=10
- TOKEN_SECRET=your_jwt_secret

## Database Setup
- Create Database:
   ```bash
    CREATE DATABASE cultural_sites_dev;
- Run migrations:
   ```bash
    npx db-migrate up;
- Seed the database:
   ```bash
    psql -U postgres -d cultural_sites_dev -f migrations/sqls/20250606163334-categories-seed-up.sql;
## Initial Data Fetch
After starting the backend, run this endpoint once in Postman to fetch cultural sites data:
- Postman:
   ```bash
    GET http://localhost:3000/cultural-sites/fetch/osm?lat=50.8365&lon=12.9239&radius=5;

A cron job is configured to update this data weekly automatically.

## Features
- Explore cultural heritage sites using an interactive map.

- Submit and read user reviews.

- User authentication and personalized experience.

- Integration with OpenStreetMap and Leaflet.js.


## License
This project is for academic and educational purposes.

