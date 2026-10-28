import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/config.js";

export const getUploadPath = (fileName) => path.join(config.uploads_dir, fileName);

//Borra un adjunto del disco. Si ya no estaba no es un error
export const deleteUploadedFile = async (fileName) => {
  try {
    await fs.unlink(getUploadPath(fileName));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("No se pudo borrar el archivo", fileName, error);
    }
  }
};
