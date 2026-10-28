import UserRepo from "../repository/user.repository.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";

const userRepo = new UserRepo();

export default class UserService {
  constructor() {}

  login = async (email, password) => {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return null;
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return null;
    }

    const isValidPass = await comparePassword(password, user.password);

    if (!isValidPass) {
      return null;
    }

    const { password: _, ...usuario } = user;

    return usuario;
  };

  create = async (email, name, password, rol_id, activo, office_id) => {
    const passHash = await hashPassword(password);
    return await userRepo.create({
      email,
      name,
      password: passHash,
      rol_id,
      activo,
      office_id,
    });
  };

  //Un usuario desactivado no puede renovar el token
  refresh = async (id) => {
    const user = await userRepo.findById(id);
    if (!user || !user.activo) {
      return null;
    }
    return user;
  };

  getUsers = () => {
    return userRepo.findAll();
  };

  getUserByid = (id) => {
    return userRepo.findById(id);
  };

  updateUser = async (id, datos) => {
    const user = await userRepo.findById(id);

    if (!user) {
      return null;
    }

    //null = no se cambia la contraseña
    let password = null;

    if (datos.password && datos.password !== "") {
      password = await hashPassword(datos.password);
    }
    const datosUpdate = {
      ...datos,
      password,
    };
    return userRepo.update(id, datosUpdate);
  };

  deleteUser = async (id) => {
    const user = await userRepo.findById(id);

    if (!user) {
      return null;
    }

    return userRepo.deactivate(id);
  };
}
