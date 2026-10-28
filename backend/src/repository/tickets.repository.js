import pool from "../db/connectionDB.js";

//Columnas por las que se puede ordenar. Nunca se pone en el SQL lo que manda el cliente,
//solo un valor de esta lista (asi no hay inyeccion SQL)
const SORT_COLUMNS = {
  created_at: "t.created_at",
  date: "t.date",
  title: "t.title",
  priority: "t.priority_id",
  state: "t.state_id",
};

export default class TicketRepo {
  //Listado con filtros, busqueda, orden y paginacion
  //Cada filtro que llega agrega una condicion al WHERE y su valor a "values" ($1, $2...)
  findMany = async (options) => {
    const {
      participantId,
      state_id,
      priority_id,
      category_id,
      office_id,
      search,
      sort,
      order,
      limit,
      offset,
    } = options;

    const conditions = [];
    const values = [];

    //Usuario comun: solo tickets donde es solicitante, asignado o de un area asignada
    if (participantId) {
      values.push(participantId);
      const n = values.length;
      conditions.push(`(
        EXISTS (SELECT 1 FROM ticket_requesters tr WHERE tr.ticket_id = t.id AND tr.user_id = $${n})
        OR EXISTS (SELECT 1 FROM ticket_assignees ta WHERE ta.ticket_id = t.id AND ta.user_id = $${n})
        OR EXISTS (
            SELECT 1 FROM ticket_areas tar
            INNER JOIN user_area ua ON ua.area_id = tar.area_id
            WHERE tar.ticket_id = t.id AND ua.user_id = $${n}
        )
      )`);
    }
    if (state_id) {
      values.push(state_id);
      conditions.push(`t.state_id = $${values.length}`);
    }
    if (priority_id) {
      values.push(priority_id);
      conditions.push(`t.priority_id = $${values.length}`);
    }
    if (category_id) {
      values.push(category_id);
      conditions.push(`t.category_id = $${values.length}`);
    }
    //La oficina del ticket es la oficina del usuario que lo creo
    if (office_id) {
      values.push(office_id);
      conditions.push(`u.office_id = $${values.length}`);
    }
    //Busca en titulo y descripcion. Se escapan % y _ para que se busquen como texto
    if (search) {
      values.push(`%${search.replace(/[\\%_]/g, "\\$&")}%`);
      const n = values.length;
      conditions.push(`(t.title ILIKE $${n} OR t.description ILIKE $${n})`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sortColumn = SORT_COLUMNS[sort] || SORT_COLUMNS.created_at;
    const sortOrder = order === "asc" ? "ASC" : "DESC";

    const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM tickets t
    INNER JOIN users u
        ON u.id = t.created_by
    ${where}
    `;

    const dataQuery = `
    SELECT
        t.id,
        t.title,
        t.description,
        t.date,
        t.created_at,
        t.category_id,
        c.category,
        t.priority_id,
        p.priority,
        t.state_id,
        s.state,
        t.created_by,
        u.nombre AS created_by_name,
        u.office_id,
        o.office
    FROM tickets t
    INNER JOIN categories c
        ON c.id = t.category_id
    INNER JOIN priorities p
        ON p.id = t.priority_id
    INNER JOIN states s
        ON s.id = t.state_id
    INNER JOIN users u
        ON u.id = t.created_by
    LEFT JOIN offices o
        ON o.id = u.office_id
    ${where}
    ORDER BY ${sortColumn} ${sortOrder}, t.id DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const countResult = await pool.query(countQuery, values);
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
    return { rows: dataResult.rows, total: countResult.rows[0].total };
  };

  findById = async (id) => {
    const query = `
        SELECT id,
            title,
            description,
            category_id,
            date,
            priority_id,
            state_id,
            created_by,
            created_at
        FROM tickets 
        WHERE id=$1 
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  };

  //Consulta todo lo asociado al ticket (Respuestas, estados, asignados, areas...)
  getDetailsById = async (id) => {
    //jsonb_build_object Función de construcción de JSONB
    //COALESCE Función si el primer valor es NULL devuelve otro valor indicado
    //jsonb_agg agrupa varias filas en un unico array JSONB
    const query = `
    SELECT 
        t.id,
        t.title,
        t.description,
        t.date,
        t.created_at,
        t.created_by,

        jsonb_build_object(
            'id', c.id,
            'category', c.category 
        ) AS category,

        jsonb_build_object(
            'id', p.id,
            'priority', p.priority
        ) AS priority,
        
        jsonb_build_object(
            'id', s.id,
            'state', s.state
        ) AS state,

        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', u.id,
                    'name', u.nombre,
                    'email', u.email,
                    'rol', r.rol
                )
            )
            FROM ticket_requesters tr
            INNER JOIN users u
                ON u.id = tr.user_id
            INNER JOIN roles r
                ON r.id= u.rol_id
            WHERE tr.ticket_id = t.id
        ), '[]') AS requesters,


        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', u.id,
                    'name', u.nombre,
                    'email', u.email,
                    'rol', r.rol
                )
            )
            FROM ticket_assignees ta
            INNER JOIN users u
                ON u.id = ta.user_id
            INNER JOIN roles r
                ON r.id= u.rol_id
            WHERE ta.ticket_id = t.id
        ), '[]') AS assignees,

        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', a.id,
                    'area', a.area
                )
            )
            FROM ticket_areas ta
            INNER JOIN areas a
                ON a.id=ta.area_id
            WHERE ta.ticket_id = t.id
        ),'[]') AS areas,

        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', tr.id,
                    'message', tr.message,
                    'created_at', tr.created_at,
                    'user', jsonb_build_object(
                        'id', u.id,
                        'name', u.nombre,
                        'email', u.email,
                        'rol', r.rol
                    )
                )
                ORDER BY tr.created_at ASC
            )
            FROM ticket_replies tr
            INNER JOIN users u
                ON u.id = tr.user_id
            INNER JOIN roles r
                ON r.id = u.rol_id
            WHERE tr.ticket_id = t.id
        ), '[]') AS replies,

        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', adj.id,
                    'original_name', adj.original_name,
                    'mime_type', adj.mime_type,
                    'size', adj.size,
                    'created_at', adj.created_at,
                    'user', jsonb_build_object(
                        'id', u.id,
                        'name', u.nombre
                    )
                )
                ORDER BY adj.created_at ASC
            )
            FROM ticket_attachments adj
            INNER JOIN users u
                ON u.id = adj.user_id
            WHERE adj.ticket_id = t.id
        ), '[]') AS attachments

        FROM tickets t

        INNER JOIN categories c
            ON c.id=t.category_id

        INNER JOIN priorities p
            ON p.id = t.priority_id

        INNER JOIN states s
            ON s.id = t.state_id

        WHERE t.id = $1;
        
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  };

  create = async (datos) => {
    let { title, description, category_id, state_id, priority_id, created_by } =
      datos;

    const query = `
        INSERT INTO tickets (title, description, category_id, state_id, priority_id, created_by, date, created_at)
        VALUES ($1,$2,$3,$4,$5,$6, CURRENT_DATE, NOW())
        RETURNING id, title, description, category_id, state_id, priority_id, created_by, date, created_at;
    `;

    const values = [
      title,
      description,
      category_id,
      state_id,
      priority_id,
      created_by,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  };

  update = async (id, datos) => {
    try {
      let { title, description, category_id, priority_id, state_id } = datos;
      const query = `
            UPDATE tickets SET 
                title=$1,
                description=$2,
                category_id=$3,
                priority_id=$4,
                state_id=$5
            WHERE id=$6
            RETURNING id, title, description, category_id,date, priority_id,state_id, created_by, created_at
        `;
      let values = [title, description, category_id, priority_id, state_id, id];
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  };

  //Cambia solo el estado o solo la prioridad. Devuelven null si el ticket no existe
  updateState = async (id, stateId) => {
    const query = `
    UPDATE tickets SET
        state_id = $1
    WHERE id = $2
    RETURNING id, title, description, category_id, date, priority_id, state_id, created_by, created_at
    `;
    const result = await pool.query(query, [stateId, id]);
    return result.rows[0] || null;
  };

  updatePriority = async (id, priorityId) => {
    const query = `
    UPDATE tickets SET
        priority_id = $1
    WHERE id = $2
    RETURNING id, title, description, category_id, date, priority_id, state_id, created_by, created_at
    `;
    const result = await pool.query(query, [priorityId, id]);
    return result.rows[0] || null;
  };

  delete = async (id) => {
    try {
      const query = `
            DELETE FROM TICKETS WHERE id=$1 
            RETURNING id, title, description, category_id,date, priority_id,state_id, created_by, created_at
        `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  };

  //Solicitantes y asignados
  addRequester = async (ticketId, userId) => {
    const query = `
    INSERT INTO ticket_requesters (ticket_id, user_id)
    VALUES ($1, $2)
    RETURNING *
  `;

    const values = [ticketId, userId];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
  };

  //Todo en una transaccion: si falla un insert (ej: un usuario que no existe)
  //se deshacen todos y no queda el ticket asignado a medias
  //ON CONFLICT DO NOTHING: si ya estaba asignado no tira error, no inserta nada
  addAssignees = async (ticketId, userIds, areaIds) => {
    const queryUser = `
    INSERT INTO ticket_assignees (ticket_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *
    `;
    const queryArea = `
    INSERT INTO ticket_areas (ticket_id, area_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *
    `;

    //Para una transaccion hace falta usar siempre la misma conexion (client)
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const users = [];
      for (const userId of userIds) {
        const result = await client.query(queryUser, [ticketId, userId]);
        if (result.rows[0]) {
          users.push(result.rows[0]);
        }
      }

      const areas = [];
      for (const areaId of areaIds) {
        const result = await client.query(queryArea, [ticketId, areaId]);
        if (result.rows[0]) {
          areas.push(result.rows[0]);
        }
      }

      await client.query("COMMIT");
      return { users, areas };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  //Desasignar: devuelven null si no estaba asignado
  removeRequester = async (ticketId, userId) => {
    const query = `
    DELETE FROM ticket_requesters
    WHERE ticket_id = $1 AND user_id = $2
    RETURNING *
    `;
    const result = await pool.query(query, [ticketId, userId]);
    return result.rows[0] || null;
  };

  removeAssignee = async (ticketId, userId) => {
    const query = `
    DELETE FROM ticket_assignees
    WHERE ticket_id = $1 AND user_id = $2
    RETURNING *
    `;
    const result = await pool.query(query, [ticketId, userId]);
    return result.rows[0] || null;
  };

  removeArea = async (ticketId, areaId) => {
    const query = `
    DELETE FROM ticket_areas
    WHERE ticket_id = $1 AND area_id = $2
    RETURNING *
    `;
    const result = await pool.query(query, [ticketId, areaId]);
    return result.rows[0] || null;
  };

  //true si el usuario es solicitante, asignado o pertenece a un area asignada al ticket
  isParticipant = async (ticketId, userId) => {
    const query = `
    SELECT EXISTS (
        SELECT 1 FROM ticket_requesters
        WHERE ticket_id = $1 AND user_id = $2

        UNION ALL

        SELECT 1 FROM ticket_assignees
        WHERE ticket_id = $1 AND user_id = $2

        UNION ALL

        SELECT 1 FROM ticket_areas ta
        INNER JOIN user_area ua
            ON ua.area_id = ta.area_id
        WHERE ta.ticket_id = $1 AND ua.user_id = $2
    ) AS is_participant
    `;
    const result = await pool.query(query, [ticketId, userId]);
    return result.rows[0].is_participant;
  };
}
