import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config/config.js";

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILES = 5;

//Extensiones permitidas y su tipo. El tipo se toma de aca y no del que manda el cliente
const ALLOWED_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

fs.mkdirSync(config.uploads_dir, { recursive: true });

const storage = multer.diskStorage({
  destination: config.uploads_dir,
  //Se guarda con un nombre aleatorio, nunca con el nombre original
  //(evita pisar archivos y nombres con rutas raras como "../../app.js")
  filename: (req, file, cb) => {
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_TYPES[ext]) {
    const error = new Error(
      `Tipo de archivo no permitido. Se aceptan: ${Object.keys(ALLOWED_TYPES).join(", ")}`,
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error);
  }
  file.mimetype = ALLOWED_TYPES[ext];
  file.originalname = file.originalname.slice(0, 255);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  //utf8: para que los nombres con tildes o ñ lleguen bien (por defecto multer usa latin1)
  defParamCharset: "utf8",
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: MAX_FILES },
}).array("files", MAX_FILES);

//Envuelve multer para devolver 400 con un mensaje claro en vez de un 500
//Si hay un error, multer ya borra los archivos que llego a guardar
export const uploadFiles = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) {
      return next();
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .send({ error: `Cada archivo puede pesar hasta ${MAX_FILE_SIZE_MB} MB` });
    }
    if (
      error.code === "LIMIT_FILE_COUNT" ||
      error.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).send({
        error: `Se pueden subir hasta ${MAX_FILES} archivos en el campo "files"`,
      });
    }
    if (error.code === "INVALID_FILE_TYPE") {
      return res.status(400).send({ error: error.message });
    }
    console.error(error);
    return res.status(500).send({ error: "Error interno al subir archivos" });
  });
};
