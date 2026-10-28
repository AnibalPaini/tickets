import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import usersController from "../controllers/users.controller.js";

export const router = Router();

//Roles: 1 Usuario, 2 Soporte, 3 Administrador

//AUTH
router.post("/login", usersController.loginUser);
router.post("/logout", usersController.logout);
router.post("/auth/refresh", usersController.refresh);

//CRUD ADMIN
//Soporte necesita la lista para asignar tickets, el Usuario comun no
router.get(
  "/",
  authMiddleware,
  authorizationMiddleware(2, 3),
  usersController.getUsers,
);
//El Usuario comun solo puede ver su propio usuario (se revisa en el controller)
router.get("/:id", authMiddleware, validateIds, usersController.getUserByid);
router.post(
  "/",
  authMiddleware,
  authorizationMiddleware(3),
  usersController.createUser,
);
router.put(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  usersController.putUser,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  usersController.deleteUser,
);
