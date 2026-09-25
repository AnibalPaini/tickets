import pool from "../db/connectionDB.js";
import UserRepo from "../repository/user.repository.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";

const userRepo = new UserRepo();

export default class UserService {
  constructor() {}

  login = async (email, password) => {
    const user = await userRepo.getUserByEmail(email);
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

  create = async (email, name, password, rol_id, activo) => {
    try {
      const passHash = await hashPassword(password);
      const query = `
                INSERT INTO users(
                    email,
                    name,
                    password,
                    rol_id,
                    activo
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, email, name, rol_id, activo
            `;
      const values = [email, name, passHash, rol_id, activo];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      throw error;
    }
  };

  refresh = (id) => {
    return userRepo.getUserByid(id);
  };

  getUsers = () => {
    return userRepo.getUsers();
  };

  getUserByid = (id) => {
    return userRepo.getUserByid(id);
  };
}
