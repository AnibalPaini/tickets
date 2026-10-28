import pool from "../db/connectionDB.js";

//En la DB la columna es "nombre", se devuelve como "name" para la API
export default class UserRepo {
  findAll = async () => {
    try {
      const query = `
      SELECT id, nombre AS name, email, activo, rol_id, office_id FROM users;
    `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.log("Error repo user findAll");
      throw error;
    }
  };

  findById = async (id) => {
    try {
      const query = `
      SELECT id, nombre AS name, email, activo, rol_id, office_id FROM users WHERE(id= $1) LIMIT 1;
    `;
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user id");
      throw error;
    }
  };

  //Varios usuarios de una vez (ANY: el id esta dentro del array)
  findByIds = async (ids) => {
    try {
      const query = `
      SELECT id, nombre AS name, email, activo, rol_id, office_id FROM users WHERE id = ANY($1::int[]);
    `;
      const { rows } = await pool.query(query, [ids]);
      return rows;
    } catch (error) {
      console.log("Error repo user findByIds");
      throw error;
    }
  };

  findByEmail = async (email) => {
    try {
      const query = `
      SELECT id, nombre AS name, email, password, activo, rol_id, office_id FROM users WHERE(email= $1) LIMIT 1;
    `;
      const { rows } = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user email");
      throw error;
    }
  };

  create = async (datos) => {
    try {
      const { email, name, password, rol_id, activo, office_id } = datos;
      const query = `
      INSERT INTO users (email, nombre, password, rol_id, activo, office_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre AS name, email, rol_id, activo, office_id
    `;
      const values = [email, name, password, rol_id, activo, office_id];
      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user create");
      throw error;
    }
  };

  //Baja logica: no se borra porque tickets y respuestas lo referencian
  deactivate = async (id) => {
    try {
      const query = `
      UPDATE users SET activo = false WHERE id = $1
      RETURNING id, nombre AS name, email, rol_id, activo, office_id;
    `;
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.log("Error repo user deactivate");
      throw error;
    }
  };

  update = async (id, datos) => {
    try {
      const { email, name, password, rol_id, activo, office_id } = datos;
      //COALESCE: si password viene null se mantiene la que ya tenia
      const query = `
      UPDATE users SET
         email=$1,
         nombre=$2,
         password=COALESCE($3, password),
         rol_id=$4,
         activo=$5,
         office_id=$6
        WHERE id=$7
        RETURNING id, nombre AS name, email, rol_id, activo, office_id
    `;
      const values = [email, name, password, rol_id, activo, office_id, id];
      const result = await pool.query(query, values);

      return result.rows[0] || null;
    } catch (error) {
      console.log("Error repo user update");
      throw error;
    }
  };
}
