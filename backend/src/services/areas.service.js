import AreaRepo from "../repository/areas.repository.js";
import UserRepo from "../repository/user.repository.js";
import { ROLES } from "../utils/roles.js";
const areaRepo = new AreaRepo();
const userRepo = new UserRepo();

export default class AreaService {
  getAreas = async () => {
    return await areaRepo.findAll();
  };

  getAreaById = async (id) => {
    return await areaRepo.findById(id);
  };

  //Devuelve null si no existe el area
  getAreaUsers = async (areaId) => {
    const area = await areaRepo.findById(areaId);
    if (!area) {
      return null;
    }
    return await areaRepo.findUsers(areaId);
  };

  //Solo pueden estar en un area los tecnicos: usuarios activos con rol Soporte o Admin
  //(estar en un area da permiso para ver y responder los tickets de esa area)
  //Devuelve los IDs que no son tecnicos validos (no existen, estan inactivos o son Usuario)
  findInvalidTechnicians = async (userIds) => {
    const users = await userRepo.findByIds(userIds);
    return userIds.filter((id) => {
      const user = users.find((u) => u.id === Number(id));
      return (
        !user ||
        !user.activo ||
        (user.rol_id !== ROLES.SOPORTE && user.rol_id !== ROLES.ADMIN)
      );
    });
  };

  addUsers = async (areaId, userIds) => {
    //Se sacan los repetidos por si mandan el mismo ID dos veces
    const uniqueIds = [...new Set(userIds.map(Number))];
    return await areaRepo.addUsers(areaId, uniqueIds);
  };

  removeUser = async (areaId, userId) => {
    return await areaRepo.removeUser(areaId, userId);
  };
}
