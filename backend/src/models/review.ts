// @ts-expect-error: Importing client for database connection
import client from '../database';
import { Review, ReviewCreation } from '../types/types';

export class ReviewModel {
  async create(review: ReviewCreation): Promise<Review> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        INSERT INTO reviews (user_id, site_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await conn.query(sql, [
        review.user_id,
        review.site_id,
        review.rating,
        review.comment || null
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create review. Error: ${err}`);
    }
  }

  async getById(id: number): Promise<Review | null> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'SELECT * FROM reviews WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not get review by ID ${id}. Error: ${err}`);
    }
  }

  async getBySiteId(siteId: number): Promise<Review[]> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT r.*, u.username, u.first_name, u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.site_id = $1
        ORDER BY r.created_at DESC
      `;
      const result = await conn.query(sql, [siteId]);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get reviews by site ID ${siteId}. Error: ${err}`
      );
    }
  }

  async getByUserId(userId: number): Promise<Review[]> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT r.*, cs.name as site_name, cs.type as site_type
        FROM reviews r
        JOIN cultural_sites cs ON r.site_id = cs.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
      `;
      const result = await conn.query(sql, [userId]);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(
        `Could not get reviews by user ID ${userId}. Error: ${err}`
      );
    }
  }

  async getAverageRatingBySiteId(siteId: number): Promise<number | null> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT AVG(rating) as average_rating
        FROM reviews
        WHERE site_id = $1
      `;
      const result = await conn.query(sql, [siteId]);
      conn.release();

      if (result.rows[0].average_rating) {
        return parseFloat(result.rows[0].average_rating);
      }
      return null;
    } catch (err) {
      throw new Error(
        `Could not get average rating by site ID ${siteId}. Error: ${err}`
      );
    }
  }

  async countBySiteId(siteId: number): Promise<number> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT COUNT(*) as count
        FROM reviews
        WHERE site_id = $1
      `;
      const result = await conn.query(sql, [siteId]);
      conn.release();

      return parseInt(result.rows[0].count);
    } catch (err) {
      throw new Error(
        `Could not count reviews by site ID ${siteId}. Error: ${err}`
      );
    }
  }

  async update(
    id: number,
    userId: number,
    updates: { rating?: number; comment?: string }
  ): Promise<Review | null> {
    try {
      let sql = 'UPDATE reviews SET ';
      const params: any[] = [];
      const setValues: string[] = [];
      let paramCounter = 1;

      if (updates.rating !== undefined) {
        setValues.push(`rating = $${paramCounter++}`);
        params.push(updates.rating);
      }
      if (updates.comment !== undefined) {
        setValues.push(`comment = $${paramCounter++}`);
        params.push(updates.comment || null);
      }
      if (setValues.length === 0) {
        throw new Error('No fields to update');
      }

      sql += setValues.join(', ');
      sql += ` WHERE id = $${paramCounter++} AND user_id = $${paramCounter} RETURNING *`;
      params.push(id, userId);

      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, params);
      conn.release();

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update review with ID ${id}. Error: ${err}`);
    }
  }

  async delete(id: number, userId: number): Promise<boolean> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql =
        'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id';
      const result = await conn.query(sql, [id, userId]);
      conn.release();

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`Could not delete review with ID ${id}. Error: ${err}`);
    }
  }

  async getExistingReview(
    userId: number,
    siteId: number
  ): Promise<number | null> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT id FROM reviews
        WHERE user_id = $1 AND site_id = $2
        LIMIT 1
      `;
      const result = await conn.query(sql, [userId, siteId]);
      conn.release();

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0].id;
    } catch (err) {
      throw new Error(`Could not check existing review. Error: ${err}`);
    }
  }
}

export default new ReviewModel();
