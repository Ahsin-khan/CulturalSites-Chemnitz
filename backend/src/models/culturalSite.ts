// @ts-expect-error: Importing client for database connection
import client from '../database';
import { CulturalSite, CulturalSiteCreation } from '../types/types';

class CulturalSiteModel {
  // Create a new cultural site
  async create(site: CulturalSiteCreation): Promise<CulturalSite> {
    try {
      const sql = `
        INSERT INTO cultural_sites (
          osm_id, name, type, description, latitude, longitude, 
          address, opening_hours, website, phone, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [
        site.osm_id,
        site.name,
        site.type,
        site.description || null,
        site.latitude,
        site.longitude,
        site.address ? JSON.stringify(site.address) : null,
        site.opening_hours || null,
        site.website || null,
        site.phone || null,
        JSON.stringify(site.tags)
      ]);
      conn.release();

      return result.rows[0];
    } catch (error) {
      console.error('Error creating cultural site:', error);
      throw new Error(`Could not create cultural site: ${error}`);
    }
  }

  // Get a cultural site by ID
  async getById(id: number): Promise<CulturalSite | null> {
    try {
      const sql = 'SELECT * FROM cultural_sites WHERE id = $1';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting cultural site by ID:', error);
      throw new Error(`Could not get cultural site by ID: ${error}`);
    }
  }

  // Get a cultural site by OSM ID
  async getByOsmId(osmId: number): Promise<CulturalSite | null> {
    try {
      const sql = 'SELECT * FROM cultural_sites WHERE osm_id = $1';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [osmId]);
      conn.release();

      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting cultural site by OSM ID:', error);
      throw new Error(`Could not get cultural site by OSM ID: ${error}`);
    }
  }

  // Get all cultural sites
  async getAll(offset: number = 0): Promise<CulturalSite[]> {
    try {
      const sql = 'SELECT * FROM cultural_sites ORDER BY name OFFSET $1';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [offset]);
      //console.log(result)
      conn.release();

      return result.rows;
    } catch (error) {
      console.error('Error getting all cultural sites:', error);
      throw new Error(`Could not get cultural sites: ${error}`);
    }
  }

  // Count all cultural sites
  async countAll(): Promise<number> {
    try {
      const sql = 'SELECT COUNT(*) FROM cultural_sites';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql);
      conn.release();
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error getting all cultural sites:', error);
      throw new Error(`Could not get cultural sites: ${error}`);
    }
  }

  // Get cultural sites by type
  async getByType(
    type: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CulturalSite[]> {
    try {
      const sql =
        'SELECT * FROM cultural_sites WHERE type = $1 ORDER BY name LIMIT $2 OFFSET $3';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [type, limit, offset]);
      conn.release();

      return result.rows;
    } catch (error) {
      console.error('Error getting cultural sites by type:', error);
      throw new Error(`Could not get cultural sites by type: ${error}`);
    }
  }

  // Search cultural sites by name
  async search(
    query: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CulturalSite[]> {
    try {
      const sql = `
        SELECT * FROM cultural_sites 
        WHERE name ILIKE $1 
        ORDER BY name 
        LIMIT $2 OFFSET $3
      `;
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [`%${query}%`, limit, offset]);
      conn.release();

      return result.rows;
    } catch (error) {
      console.error('Error searching cultural sites:', error);
      throw new Error(`Could not search cultural sites: ${error}`);
    }
  }

  // Find nearby cultural sites
  async findNearby(
    lat: number,
    lon: number,
    radius: number = 5
  ): Promise<CulturalSite[]> {
    try {
      //console.log('Executing findNearby SQL with params:', lat, lon, radius, limit);

      const sql = `
        SELECT *, 
          (6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )) AS distance
        FROM cultural_sites
        WHERE (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) < $3
        ORDER BY distance
        
      `;
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [lat, lon, radius]);
      conn.release();

      return result.rows;
    } catch (error) {
      console.error('Error finding nearby cultural sites:', error);
      throw new Error(`Could not find nearby cultural sites: ${error}`);
    }
  }

  // Update a cultural site
  async update(
    id: number,
    site: Partial<CulturalSiteCreation>
  ): Promise<CulturalSite> {
    try {
      let sql = 'UPDATE cultural_sites SET ';
      const params: any[] = [];
      const setValues: string[] = [];
      let index = 1;

      if (site.name !== undefined) {
        setValues.push(`name = $${index++}`);
        params.push(site.name);
      }
      if (site.type !== undefined) {
        setValues.push(`type = $${index++}`);
        params.push(site.type);
      }
      if (site.description !== undefined) {
        setValues.push(`description = $${index++}`);
        params.push(site.description || null);
      }
      if (site.latitude !== undefined) {
        setValues.push(`latitude = $${index++}`);
        params.push(site.latitude);
      }
      if (site.longitude !== undefined) {
        setValues.push(`longitude = $${index++}`);
        params.push(site.longitude);
      }
      if (site.address !== undefined) {
        setValues.push(`address = $${index++}`);
        params.push(site.address ? JSON.stringify(site.address) : null);
      }
      if (site.opening_hours !== undefined) {
        setValues.push(`opening_hours = $${index++}`);
        params.push(site.opening_hours || null);
      }
      if (site.website !== undefined) {
        setValues.push(`website = $${index++}`);
        params.push(site.website || null);
      }
      if (site.phone !== undefined) {
        setValues.push(`phone = $${index++}`);
        params.push(site.phone || null);
      }
      if (site.tags !== undefined) {
        setValues.push(`tags = $${index++}`);
        params.push(JSON.stringify(site.tags));
      }

      if (setValues.length === 0) {
        throw new Error('No fields to update');
      }

      sql += setValues.join(', ');
      sql += ` WHERE id = $${index} RETURNING *`;
      params.push(id);
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, params);
      conn.release();

      if (result.rows.length) {
        return result.rows[0];
      }

      throw new Error(`Cultural site with ID ${id} not found`);
    } catch (error) {
      console.error('Error updating cultural site:', error);
      throw new Error(`Could not update cultural site: ${error}`);
    }
  }

  // Delete a cultural site
  async delete(id: number): Promise<boolean> {
    try {
      const sql = 'DELETE FROM cultural_sites WHERE id = $1 RETURNING id';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting cultural site:', error);
      throw new Error(`Could not delete cultural site: ${error}`);
    }
  }

  // Check if a cultural site exists by OSM ID
  async existsByOsmId(osmId: number): Promise<boolean> {
    try {
      const sql = 'SELECT id FROM cultural_sites WHERE osm_id = $1 LIMIT 1';
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const result = await conn.query(sql, [osmId]);
      conn.release();

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if cultural site exists:', error);
      throw new Error(`Could not check if cultural site exists: ${error}`);
    }
  }
}

export default new CulturalSiteModel();
