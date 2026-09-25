import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const generateAccessToken = ({ id, rol_id, email }) => {
  return jwt.sign({ id, rol_id, email }, config.jwt_access_secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = ({ id }) => {
  return jwt.sign({ id }, config.jwt_refresh_secret, { expiresIn: "14d" });
};

export const jwtVerifyAccess = (tokenAccess) => {
  return jwt.verify(tokenAccess, config.jwt_access_secret);
};

export const jwtVerifyRefresh = (tokenRefresh) => {
  return jwt.verify(tokenRefresh, config.jwt_refresh_secret);
};
