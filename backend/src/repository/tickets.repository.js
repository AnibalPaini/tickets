import pool from "../db/connectionDB.js";
export default class TicketRepo {
  getAll = async () => {
    const query = `
    SELECT * FROM tickets
    `;
    const rows = await pool.query(query);
    return rows[0] || null;
  };
  getById = async (id) => {
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
                    'name', u.name,
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
                    'name', u.name,
                    'email', u.email,
                    'rol', r.rol
                )
            )
            FROM ticket_assignees ta
            INNER JOIN users u
                ON u.id = ta.user_id
            INNER JOIN roles 
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
                        'name', u.name,
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
        ), '[]') AS replies

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
    const query=''

  };
  update = async () => {};
  delete = async () => {};
}
