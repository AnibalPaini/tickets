import pool from "../db/connectionDB.js";

export default class UserRepo {
  getUsers = async () => {
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

  getUserByid = async (id) => {
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

  getUserByEmail = async (email) => {
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
}
