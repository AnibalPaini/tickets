import AreaService from "../services/areas.service.js";
import { isValidId } from "../utils/validators.js";
const areaService = new AreaService();

const getAreas = async (req, res) => {
  try {
    const areas = await areaService.getAreas();
    return res.status(200).send({ payload: areas });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Error interno al obtener areas" });
  }
};

const getAreaUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const users = await areaService.getAreaUsers(id);
    if (!users) {
      return res.status(404).send({ error: "No se encontro el area!" });
    }
    return res.status(200).send({ payload: users });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al obtener los tecnicos del area" });
  }
};

//Body: { userIds: [1, 2, 3] }
const addAreaUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .send({ error: "userIds tiene que ser un array con al menos un ID" });
    }
    if (!userIds.every(isValidId)) {
      return res.status(400).send({ error: "Hay IDs que no son validos" });
    }
    const area = await areaService.getAreaById(id);
    if (!area) {
      return res.status(404).send({ error: "No se encontro el area!" });
    }
    const invalidIds = await areaService.findInvalidTechnicians(userIds);
    if (invalidIds.length > 0) {
      return res.status(400).send({
        error:
          "Solo se pueden agregar usuarios activos con rol Soporte o Administrador",
        invalidIds,
      });
    }
    const added = await areaService.addUsers(id, userIds);
    return res.status(200).send({ payload: added });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al agregar tecnicos al area" });
  }
};

const removeAreaUser = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const removed = await areaService.removeUser(id, userId);
    if (!removed) {
      return res
        .status(404)
        .send({ error: "El usuario no esta en esa area" });
    }
    return res.status(200).send({ payload: removed });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al sacar el tecnico del area" });
  }
};

export { getAreas, getAreaUsers, addAreaUsers, removeAreaUser };
