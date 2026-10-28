import 'dotenv/config'
import { fileURLToPath } from "node:url";

export const config={
    port: process.env.PORT || 8080,
    db_host:process.env.DB_HOST || "localhost",
    db_port:process.env.DB_PORT || 5432,
    db_pass:process.env.DB_PASS,
    db_name:process.env.DB_NAME,
    db_user:process.env.DB_USER,
    jwt_access_secret:process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret:process.env.JWT_REFRESH_SECRET,
    cookie_secret:process.env.COOKIE_SECRET,
    cookie_name:process.env.COOKIOE_NAME,
    node_env:process.env.ENV || "dev",
    frontend_url:process.env.FRONTEND_URL || "http://localhost:5173",
    //Carpeta de los adjuntos: por defecto backend/uploads
    uploads_dir:process.env.UPLOADS_DIR || fileURLToPath(new URL("../../uploads/", import.meta.url))
}