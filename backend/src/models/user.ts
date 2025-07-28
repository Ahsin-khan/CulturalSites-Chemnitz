// @ts-expect-error: Importing client for database connection
import client from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import { User, UserCreation } from '../types/types';

dotenv.config();

const pepper = process.env.BCRYPT_PASSWORD || '';
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');

export class UserModel {
  // Get all users
  async index(): Promise<User[]> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'SELECT * FROM users ORDER BY created_at DESC';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`);
    }
  }

  // Create a new user
  async create(u: UserCreation): Promise<User> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();

      const hashedPassword = bcrypt.hashSync(u.password + pepper, saltRounds);

      const sql = `
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, location_lat, location_lon
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await conn.query(sql, [
        u.username,
        u.email,
        hashedPassword,
        u.first_name || null,
        u.last_name || null,
        u.location_lat || null,
        u.location_lon || null
      ]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add new user. Error: ${err}`);
    }
  }

  // Get user by ID
  async show(id: number): Promise<User> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'SELECT * FROM users WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`User with id ${id} not found.`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user with ID ${id}. Error: ${err}`);
    }
  }

  // Update user fields, including password hashing if password provided
  async update(id: number, user: Partial<UserCreation>): Promise<User> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();

      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (user.username !== undefined) {
        setClauses.push(`username = $${paramIndex++}`);
        values.push(user.username);
      }
      if (user.email !== undefined) {
        setClauses.push(`email = $${paramIndex++}`);
        values.push(user.email);
      }
      if (user.password !== undefined) {
        const hashedPassword = bcrypt.hashSync(
          user.password + pepper,
          saltRounds
        );
        setClauses.push(`password_hash = $${paramIndex++}`);
        values.push(hashedPassword);
      }
      if (user.first_name !== undefined) {
        setClauses.push(`first_name = $${paramIndex++}`);
        values.push(user.first_name);
      }
      if (user.last_name !== undefined) {
        setClauses.push(`last_name = $${paramIndex++}`);
        values.push(user.last_name);
      }
      if (user.location_lat !== undefined) {
        setClauses.push(`location_lat = $${paramIndex++}`);
        values.push(user.location_lat);
      }
      if (user.location_lon !== undefined) {
        setClauses.push(`location_lon = $${paramIndex++}`);
        values.push(user.location_lon);
      }

      if (setClauses.length === 0) {
        throw new Error('No fields to update');
      }

      const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await conn.query(sql, values);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`User with id ${id} not found.`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update user. Error: ${err}`);
    }
  }

  // Delete user by ID, returns true if deleted
  async delete(id: number): Promise<boolean> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`Could not delete user with id: ${id}. Error: ${err}`);
    }
  }

  // Authenticate user by username and password
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'SELECT * FROM users WHERE username = $1';
      const result = await conn.query(sql, [username]);

      conn.release();

      if (result.rows.length === 0) {
        return null;
      }

      const user: User = result.rows[0];

      const isValid = bcrypt.compareSync(password + pepper, user.password_hash);

      if (isValid) {
        return user;
      }

      return null;
    } catch (err) {
      throw new Error(`Authentication failed. Error: ${err}`);
    }
  }
}

export default new UserModel();
