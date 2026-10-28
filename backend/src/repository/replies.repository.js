import pool from "../db/connectionDB.js";
export default class ReplyRepo {
  //Todas las respuestas de un ticket con los datos del usuario que respondio
  findByTicketId = async (ticketId) => {
    const query = `
    SELECT
        tr.id,
        tr.ticket_id,
        tr.message,
        tr.created_at,
        jsonb_build_object(
            'id', u.id,
            'name', u.nombre,
            'email', u.email,
            'rol', r.rol
        ) AS user
    FROM ticket_replies tr
    INNER JOIN users u
        ON u.id = tr.user_id
    INNER JOIN roles r
        ON r.id = u.rol_id
    WHERE tr.ticket_id = $1
    ORDER BY tr.created_at ASC
    `;
    const result = await pool.query(query, [ticketId]);
    return result.rows;
  };

  //Se filtra tambien por ticket para que la respuesta pertenezca a ese ticket
  findById = async (ticketId, replyId) => {
    const query = `
    SELECT id, ticket_id, user_id, message, created_at
    FROM ticket_replies
    WHERE id = $1 AND ticket_id = $2
    `;
    const result = await pool.query(query, [replyId, ticketId]);
    return result.rows[0] || null;
  };

  create = async (datos) => {
    let { ticket_id, user_id, message } = datos;

    const query = `
    INSERT INTO ticket_replies (ticket_id, user_id, message, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, ticket_id, user_id, message, created_at
    `;

    const values = [ticket_id, user_id, message];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  };

  update = async (replyId, message) => {
    const query = `
    UPDATE ticket_replies SET
        message = $1
    WHERE id = $2
    RETURNING id, ticket_id, user_id, message, created_at
    `;
    const result = await pool.query(query, [message, replyId]);
    return result.rows[0] || null;
  };

  delete = async (replyId) => {
    const query = `
    DELETE FROM ticket_replies WHERE id = $1
    RETURNING id, ticket_id, user_id, message, created_at
    `;
    const result = await pool.query(query, [replyId]);
    return result.rows[0] || null;
  };
}
