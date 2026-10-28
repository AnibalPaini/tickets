import pool from "../db/connectionDB.js";
export default class CategoryRepo {
  findAll = async () => {
    const query = `
    SELECT id, category FROM categories
    ORDER BY category ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  };

  findById = async (id) => {
    const query = `
    SELECT id, category FROM categories WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  };

  create = async (category) => {
    const query = `
    INSERT INTO categories (category)
    VALUES ($1)
    RETURNING id, category
    `;
    const result = await pool.query(query, [category]);
    return result.rows[0] || null;
  };

  update = async (id, category) => {
    const query = `
    UPDATE categories SET
        category = $1
    WHERE id = $2
    RETURNING id, category
    `;
    const result = await pool.query(query, [category, id]);
    return result.rows[0] || null;
  };

  delete = async (id) => {
    const query = `
    DELETE FROM categories WHERE id = $1
    RETURNING id, category
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  };
}
