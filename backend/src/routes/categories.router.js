import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  putCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

export const router = Router();

//Roles: 1 Usuario, 2 Soporte, 3 Administrador

//Cualquier usuario logueado puede verlas (para elegir la categoria al crear un ticket)
router.get("/", authMiddleware, getCategories);
router.get("/:id", authMiddleware, validateIds, getCategoryById);

//Gestor de categorias: solo administrador
router.post("/", authMiddleware, authorizationMiddleware(3), createCategory);
router.put(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  putCategory,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  deleteCategory,
);
