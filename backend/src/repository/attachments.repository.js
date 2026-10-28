import pool from "../db/connectionDB.js";
export default class AttachmentRepo {
  findByTicketId = async (ticketId) => {
    const query = `
    SELECT
        adj.id,
        adj.ticket_id,
        adj.original_name,
        adj.file_name,
        adj.mime_type,
        adj.size,
        adj.created_at,
        jsonb_build_object(
            'id', u.id,
            'name', u.nombre
        ) AS user
    FROM ticket_attachments adj
    INNER JOIN users u
        ON u.id = adj.user_id
    WHERE adj.ticket_id = $1
    ORDER BY adj.created_at ASC
    `;
    const result = await pool.query(query, [ticketId]);
    return result.rows;
  };

  //Se filtra tambien por ticket para que el adjunto pertenezca a ese ticket
  findById = async (ticketId, attachmentId) => {
    const query = `
    SELECT id, ticket_id, user_id, original_name, file_name, mime_type, size, created_at
    FROM ticket_attachments
    WHERE id = $1 AND ticket_id = $2
    `;
    const result = await pool.query(query, [attachmentId, ticketId]);
    return result.rows[0] || null;
  };

  //Todos en una transaccion: o se guardan todos los adjuntos o ninguno
  createMany = async (ticketId, userId, files) => {
    const query = `
    INSERT INTO ticket_attachments (ticket_id, user_id, original_name, file_name, mime_type, size)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, ticket_id, user_id, original_name, mime_type, size, created_at
    `;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const attachments = [];
      for (const file of files) {
        const values = [
          ticketId,
          userId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size,
        ];
        const result = await client.query(query, values);
        attachments.push(result.rows[0]);
      }

      await client.query("COMMIT");
      return attachments;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  delete = async (attachmentId) => {
    const query = `
    DELETE FROM ticket_attachments WHERE id = $1
    RETURNING id, ticket_id, user_id, original_name, file_name, mime_type, size, created_at
    `;
    const result = await pool.query(query, [attachmentId]);
    return result.rows[0] || null;
  };
}
