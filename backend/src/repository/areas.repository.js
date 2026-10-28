import pool from "../db/connectionDB.js";
export default class AreaRepo {
  //Areas con la cantidad de tecnicos de cada una
  findAll = async () => {
    const query = `
    SELECT
        a.id,
        a.area,
        COUNT(ua.user_id)::int AS users_count
    FROM areas a
    LEFT JOIN user_area ua
        ON ua.area_id = a.id
    GROUP BY a.id
    ORDER BY a.area ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  };

  findById = async (id) => {
    const query = `
    SELECT id, area FROM areas WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  };

  //Tecnicos de un area
  findUsers = async (areaId) => {
    const query = `
    SELECT
        u.id,
        u.nombre AS name,
        u.email,
        u.rol_id,
        u.activo
    FROM user_area ua
    INNER JOIN users u
        ON u.id = ua.user_id
    WHERE ua.area_id = $1
    ORDER BY u.nombre ASC
    `;
    const result = await pool.query(query, [areaId]);
    return result.rows;
  };

  //unnest convierte el array de IDs en filas: es un solo INSERT para todos,
  //asi si falla uno no se guarda ninguno
  //ON CONFLICT DO NOTHING: si ya estaba en el area no tira error, no inserta nada
  addUsers = async (areaId, userIds) => {
    const query = `
    INSERT INTO user_area (user_id, area_id)
    SELECT unnest($1::int[]), $2
    ON CONFLICT DO NOTHING
    RETURNING user_id, area_id
    `;
    const result = await pool.query(query, [userIds, areaId]);
    return result.rows;
  };

  //Devuelve null si el usuario no estaba en el area
  removeUser = async (areaId, userId) => {
    const query = `
    DELETE FROM user_area
    WHERE area_id = $1 AND user_id = $2
    RETURNING user_id, area_id
    `;
    const result = await pool.query(query, [areaId, userId]);
    return result.rows[0] || null;
  };
}
