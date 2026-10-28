import { isValidId } from "../utils/validators.js";

//Revisa que todos los parametros de la ruta (:id, :userId, :replyId...) sean IDs validos
//Asi un "/api/ticket/abc" devuelve 400 en vez de llegar a la DB y dar 500
export const validateIds = (req, res, next) => {
  for (const [name, value] of Object.entries(req.params)) {
    if (!isValidId(value)) {
      return res
        .status(400)
        .send({ error: `El parametro ${name} no es valido` });
    }
  }
  next();
};
