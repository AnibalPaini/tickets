import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import {
  getTickets,
  getTicketById,
  getTicketDetailsById,
  createTickets,
  putTicket,
  deleteTicket,
  addRequester,
  addAssignees,
} from "../controllers/tickets.controller.js";

export const router = Router();

//Roles: 1 Usuario, 2 Soporte, 3 Administrador

//CRUD
router.get("/", authMiddleware, getTickets);
router.get("/:id", authMiddleware, getTicketById);
router.get("/:id/details", authMiddleware, getTicketDetailsById);
router.post("/", authMiddleware, createTickets);
router.put("/:id", authMiddleware, authorizationMiddleware(2, 3), putTicket);
router.delete("/:id", authMiddleware, authorizationMiddleware(3), deleteTicket);

//Solicitantes y asignados
router.post(
  "/:id/requesters",
  authMiddleware,
  authorizationMiddleware(2, 3),
  addRequester,
);
router.post(
  "/:id/assignees",
  authMiddleware,
  authorizationMiddleware(2, 3),
  addAssignees,
);
