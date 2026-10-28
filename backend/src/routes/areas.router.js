import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import {
  getAreas,
  getAreaUsers,
  addAreaUsers,
  removeAreaUser,
} from "../controllers/areas.controller.js";

export const router = Router();

//Roles: 1 Usuario, 2 Soporte, 3 Administrador

//Cualquier usuario logueado puede ver las areas (ej: para asignar un ticket a un area)
router.get("/", authMiddleware, getAreas);

//Tecnicos por area: verlos Soporte y Admin, gestionarlos solo Admin
router.get(
  "/:id/users",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  getAreaUsers,
);
router.post(
  "/:id/users",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  addAreaUsers,
);
router.delete(
  "/:id/users/:userId",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  removeAreaUser,
);
