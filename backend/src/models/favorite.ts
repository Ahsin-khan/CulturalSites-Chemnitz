// @ts-expect-error: Importing client for database connection
import client from '../database';
import { Favorite, FavoriteCreation } from '../types/types';

export class FavoriteModel {
  // Add a favorite
  async create(favorite: FavoriteCreation): Promise<Favorite> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();
      const sql =
        'INSERT INTO favorites (user_id, site_id) VALUES ($1, $2) RETURNING *';

      const result = await conn.query(sql, [
        favorite.user_id,
        favorite.site_id
      ]);

      conn.release();

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create favorite. Error: ${err}`);
    }
  }

  // Remove a favorite
  async delete(userId: number, siteId: number): Promise<boolean> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();
      const sql =
        'DELETE FROM favorites WHERE user_id = $1 AND site_id = $2 RETURNING id';

      const result = await conn.query(sql, [userId, siteId]);

      conn.release();

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`Could not delete favorite. Error: ${err}`);
    }
  }

  // Check if a user has favorited a site
  async exists(userId: number, siteId: number): Promise<boolean> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();
      const sql =
        'SELECT id FROM favorites WHERE user_id = $1 AND site_id = $2 LIMIT 1';

      const result = await conn.query(sql, [userId, siteId]);

      conn.release();

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`Could not check if favorite exists. Error: ${err}`);
    }
  }

  //   * Get all favorites for a user
  async getByUserId(userId: number): Promise<Favorite[]> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();
      const sql = `SELECT 
                      f.id AS favorite_id,
                      f.user_id,
                      f.site_id,
                      f.created_at,
                      cs.name,
                      cs.type,
                      cs.tags,
                      cs.latitude,
                      cs.longitude
                    FROM favorites f
                    JOIN cultural_sites cs ON cs.id = f.site_id
                    WHERE f.user_id = $1`;

      const result = await conn.query(sql, [userId]);

      conn.release();

      return result.rows.map((row: any) => ({
        id: row.favorite_id,
        user_id: row.user_id,
        site_id: row.site_id,
        created_at: row.created_at,
        site: {
          id: row.site_id,
          name: row.name,
          type: row.type,
          tags: row.tags, // this includes your image URL (in tags.image)
          latitude: row.latitude,
          longitude: row.longitude
        }
      }));
    } catch (err) {
      throw new Error(`Could not get favorites by user ID. Error: ${err}`);
    }
  }

  //   * Get all favorites for a cultural site
  async getBySiteId(siteId: number): Promise<Favorite[]> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();
      const sql =
        'SELECT * FROM favorites WHERE site_id = $1 ORDER BY created_at DESC';

      const result = await conn.query(sql, [siteId]);

      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get favorites by site ID. Error: ${err}`);
    }
  }

  //   * Count favorites for a cultural site
  async countBySiteId(siteId: number): Promise<number> {
    try {
      // @ts-expect-error: Establishing connection to the database
      const conn = await client.connect();
      const sql = 'SELECT COUNT(*) FROM favorites WHERE site_id = $1';

      const result = await conn.query(sql, [siteId]);

      conn.release();

      return parseInt(result.rows[0].count);
    } catch (err) {
      throw new Error(`Could not count favorites by site ID. Error: ${err}`);
    }
  }
}

export default new FavoriteModel();
