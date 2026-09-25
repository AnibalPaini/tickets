import { config } from "../config/config.js";
import { jwtVerifyAccess } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        error: "No autenticado",
      });
    }
    const payload = jwtVerifyAccess(accessToken);
    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
};

export const authorizationMiddleware = (...roles) => {
  return (req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        return res.status(401).json({
          error: "No autenticado",
        });
      }
      const payload = jwtVerifyAccess(accessToken);
      const userRol = payload.rol_id;
      console.log(userRol);
      if (roles.includes(userRol)) {
        return next();
      } else {
        return res.status(403).send({ error: "No autorizado" });
      }
    } catch (error) {
      return res.status(401).json({
        error: "Token inválido o expirado",
      });
    }
  };
};
