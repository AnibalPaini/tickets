import UserService from "../services/user.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  jwtVerifyRefresh,
} from "../utils/jwt.js";
import { config } from "../config/config.js";
const userService = new UserService();

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Faltan datos obligatorios!" });
    }

    let user = await userService.login(email, password);

    if (!user) {
      return res.status(401).send({
        error: "Credenciales inválidas",
      });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      rol_id: user.rol_id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.node_env === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.node_env === "production",
      sameSite: "strict",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    console.log("Logeado cone exito: ", user.email);

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rol_id: user.rol_id,
      },
    });
  } catch (error) {
    console.log("Error 500 en login");
    res.status(500).send({ error: "Error interno del servidor" });
  }
};

const refresh = async (req, res) => {
  try {
    //obtenemos el refresh
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        error: "No hay refresh token",
      });
    }
    const payload = jwtVerifyRefresh(refreshToken);
    const user = await userService.refresh(payload.id);
    if (!user) {
      return res.status(401).json({
        error: "Usuario no válido o inactivo",
      });
    }
    // Generar nuevo access token
    const accessToken = generateAccessToken({
      id: user.id,
      rol_id: user.rol_id,
      email: user.email,
    });
    // Actualizar cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.node_env === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token renovado correctamente",
    });
  } catch (error) {
    return res.status(401).json({
      error: "Refresh token inválido o expirado",
    });
  }
};

const createUser = async (req, res) => {
  try {
    let { email, name, password, rol_id = 1, activo = true } = req.body;
    if (!email || !name || !password) {
      return res.status(400).send({ error: "Completar datos obligatorios!" });
    }
    const user = await userService.create(
      email,
      name,
      password,
      rol_id,
      activo,
    );
    if (!user) {
      return res
        .status(400)
        .send({ error: "Se produjo un error al crear el usuario." });
    }
    console.log(user, " Registrado con exito!");

    return res.status(201).send({ payload: user });
  } catch (error) {
    console.log("Error al crear usuario: ", error);
    return res.status(500).send({
      error: "Error interno del servidor!",
    });
  }
};

const getUserByid = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send({ error: "Falta el ID." });
    }
    const user = await userService.getUserByid(id);
    if (!user) {
      return res.status(404).send({ error: "No se encontro el usuario!" });
    }
    return res.status(200).send({ payload: user });
  } catch (error) {
    console.log("Error en getUserById");
    return res.status(500).send({ error: "Error al obtener usuario" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    return res.status(200).json({
      payload: users,
    });
  } catch (error) {
    console.log("Error en getUsers");
    return res.status(500).send({ error: "Error al obtener usuario" });
  }
};

const putUser = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    if (!id || datos.length === 0) {
      return res.status(400).send({ error: "Faltan datos" });
    }
    const userUpdated = await userService.updateUser(id, datos);
    if (!userUpdated) {
      return res
        .status(404)
        .send({ error: "No se encontro el usuario a actualzar" });
    }
    return res.status(200).send({ payload: userUpdated });
  } catch (error) {
    console.log("Error en putUser");
    return res.status(500).send({ error: "Error al actualizar usuario" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send({ error: "Faltan datos" });
    }
    const userDeleted = await userService.deleteUser(id);
    if (!userDeleted) {
      return res
        .status(404)
        .send({ error: "No se encontro el usuario al eliminar" });
    }
    return res.status(200).send({ payload: userDeleted });
  } catch (error) {
    console.log("Error en deleteUser");
    return res.status(500).send({ error: "Error al eliminar usuario" });
  }
};

export default {
  loginUser,
  getUserByid,
  getUsers,
  createUser,
  putUser,
  deleteUser,
  refresh,
};
