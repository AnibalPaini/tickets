import pool from "../db/connectionDB.js";
export default class OfficeRepo {
  findAll = async () => {
    const query = `
    SELECT id, office FROM offices
    ORDER BY office ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  };

  findById = async (id) => {
    const query = `
    SELECT id, office FROM offices WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  };

  create = async (office) => {
    const query = `
    INSERT INTO offices (office)
    VALUES ($1)
    RETURNING id, office
    `;
    const result = await pool.query(query, [office]);
    return result.rows[0] || null;
  };

  update = async (id, office) => {
    const query = `
    UPDATE offices SET
        office = $1
    WHERE id = $2
    RETURNING id, office
    `;
    const result = await pool.query(query, [office, id]);
    return result.rows[0] || null;
  };

  delete = async (id) => {
    const query = `
    DELETE FROM offices WHERE id = $1
    RETURNING id, office
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  };
}
