import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import {
  getOffices,
  getOfficeById,
  createOffice,
  putOffice,
  deleteOffice,
} from "../controllers/offices.controller.js";

export const router = Router();

//Roles: 1 Usuario, 2 Soporte, 3 Administrador

//Cualquier usuario logueado puede verlas (ej: para elegir oficina en un formulario)
router.get("/", authMiddleware, getOffices);
router.get("/:id", authMiddleware, validateIds, getOfficeById);

//Gestor de oficinas: solo administrador
router.post("/", authMiddleware, authorizationMiddleware(3), createOffice);
router.put(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  putOffice,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  deleteOffice,
);
