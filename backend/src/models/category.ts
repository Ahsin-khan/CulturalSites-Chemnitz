// @ts-expect-error: Importing client for database connection
import client from '../database';
import { Category, CategoryCreation } from '../types/types';

export class CategoryModel {
  // Get all categories
  async getAll(): Promise<Category[]> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'SELECT * FROM categories ORDER BY name';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get categories. Error: ${err}`);
    }
  }

  // Create a new category
  async create(category: CategoryCreation): Promise<Category> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        INSERT INTO categories (name, description, icon)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await conn.query(sql, [
        category.name,
        category.description || null,
        category.icon || null
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create category. Error: ${err}`);
    }
  }

  // Get category by ID, returns null if not found
  async show(id: number): Promise<Category | null> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'SELECT * FROM categories WHERE id = $1';
      const result = await conn.query(sql, [id]);
      conn.release();

      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find category with ID ${id}. Error: ${err}`);
    }
  }

  // Update a category with partial data
  async update(
    id: number,
    category: Partial<CategoryCreation>
  ): Promise<Category> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();

      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (category.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        values.push(category.name);
      }
      if (category.description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`);
        values.push(category.description || null);
      }
      if (category.icon !== undefined) {
        setClauses.push(`icon = $${paramIndex++}`);
        values.push(category.icon || null);
      }

      if (setClauses.length === 0) {
        throw new Error('No fields to update');
      }

      const sql = `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await conn.query(sql, values);
      conn.release();

      if (result.rows.length === 0) {
        throw new Error(`Category with id ${id} not found.`);
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not update category. Error: ${err}`);
    }
  }

  // Delete category by ID
  async delete(id: number): Promise<boolean> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = 'DELETE FROM categories WHERE id = $1 RETURNING id';
      const result = await conn.query(sql, [id]);
      conn.release();

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(
        `Could not delete category with id: ${id}. Error: ${err}`
      );
    }
  }

  // Add category to site association
  async addToSite(siteId: number, categoryId: number): Promise<boolean> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        INSERT INTO site_categories (site_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (site_id, category_id) DO NOTHING
        RETURNING id
      `;
      await conn.query(sql, [siteId, categoryId]);
      conn.release();
      return true;
    } catch (err) {
      throw new Error(`Could not add category to site. Error: ${err}`);
    }
  }

  // Remove category from site association
  async removeFromSite(siteId: number, categoryId: number): Promise<boolean> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        DELETE FROM site_categories
        WHERE site_id = $1 AND category_id = $2
        RETURNING id
      `;
      const result = await conn.query(sql, [siteId, categoryId]);
      conn.release();

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`Could not remove category from site. Error: ${err}`);
    }
  }

  // Get categories for a specific site
  async getBySiteId(siteId: number): Promise<Category[]> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT c.*
        FROM categories c
        JOIN site_categories sc ON c.id = sc.category_id
        WHERE sc.site_id = $1
        ORDER BY c.name
      `;
      const result = await conn.query(sql, [siteId]);
      conn.release();

      return result.rows;
    } catch (err) {
      throw new Error(`Could not get categories by site ID. Error: ${err}`);
    }
  }

  // Get site IDs for a given category with pagination
  async getSiteIds(
    categoryId: number,
    limit = 50,
    offset = 0
  ): Promise<number[]> {
    try {
      // @ts-expect-error: Importing client for database connection
      const conn = await client.connect();
      const sql = `
        SELECT sc.site_id
        FROM site_categories sc
        WHERE sc.category_id = $1
        LIMIT $2 OFFSET $3
      `;
      const result = await conn.query(sql, [categoryId, limit, offset]);
      conn.release();

      return result.rows.map((row: { site_id: number }) => row.site_id);
    } catch (err) {
      throw new Error(`Could not get site IDs by category ID. Error: ${err}`);
    }
  }
}

export default new CategoryModel();
