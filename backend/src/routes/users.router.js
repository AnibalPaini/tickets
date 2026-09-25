import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import usersController from "../controllers/users.controller.js";

export const router = Router();

//AUTH
router.post("/login", usersController.loginUser);
router.post("/auth/refresh", usersController.refresh);

//CRUD ADMIN
router.get("/", authMiddleware, usersController.getUsers);
router.get("/:id", authMiddleware, usersController.getUserByid);
router.post(
  "/",
  authMiddleware,
  authorizationMiddleware(3),
  usersController.createUser,
);
/* router.put("/:id", usersController.login)
router.delete("/:id", usersController.login) */
