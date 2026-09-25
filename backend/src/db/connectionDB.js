import pg from "pg";
import { config } from "../config/config.js";

const pool = new pg.Pool({
  host: config.db_host,
  password: config.db_pass,
  port: config.db_port,
  database: config.db_name,
  user: config.db_user,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

pool.on("error",(error)=>{
  console.error("Error inesperado en el pool de PG:", error)
})

export default pool;