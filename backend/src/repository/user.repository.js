import pool from "../db/connectionDB.js";

export default class UserRepo {
  findAll = async () => {
    try {
      const query = `
      SELECT id, email, activo, rol_id FROM users;
    `;
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user id");
      throw error;
    }
  };

  findById = async (id) => {
    try {
      const query = `
      SELECT id, email, activo, rol_id FROM users WHERE(id= $1) LIMIT 1;
    `;
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user id");
      throw error;
    }
  };

  findByEmail = async (email) => {
    try {
      const query = `
      SELECT id, email, password, activo, rol_id FROM users WHERE(email= $1) LIMIT 1;
    `;
      const { rows } = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user email");
      throw error;
    }
  };

  delete = async (id) => {
    try {
      const query = `
      DELETE FROM users WHERE id = $1
      RETURNING id, name, email, rol_id, activo;
    `;
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user delete");
      throw error;
    }
  };

  update = async (id, datos) => {
    try {
      const { email, name, password, rol_id, activo } = datos;
      const query = `
      UPDATE users SET
         email=$1,
         name=$2,
         password=$3,
         rol_id=$4,
         activo=$5
        WHERE id=$6
        RETURNING id, name, email, rol_id
    `;
      const values = [email, name, password, rol_id, activo, id];
      const result = await pool.query(query, values);

      return result.rows[0] || null;
    } catch (error) {
      console.log("Error repo user delete");
      throw error;
    }
  };
}
