import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_TEST_DB,
  POSTGRES_TEST_USER,
  ENV
} = process.env;

let client;

try {
  if (ENV === 'test') {
    client = new Pool({
      host: POSTGRES_HOST,
      database: POSTGRES_TEST_DB,
      user: POSTGRES_TEST_USER,
      password: POSTGRES_PASSWORD
    });
  } else if (ENV === 'dev') {
    client = new Pool({
      host: POSTGRES_HOST,
      database: POSTGRES_DB,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD
    });
  } else {
    throw new Error(`Invalid environment: ${ENV}`);
  }

  // Attempt to connect to the database
  client.connect((err) => {
    if (err) {
      console.error(`Error connecting to database: ${err}`);
    } else {
      console.log('Connected to database successfully!');
    }
  });
} catch (error) {
  console.error(`Error connecting to database: ${error}`);
}

export default client;
