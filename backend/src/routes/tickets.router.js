import { Router } from "express";
import {
  authMiddleware,
  authorizationMiddleware,
} from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import {
  getTickets,
  getTicketById,
  getTicketDetailsById,
  createTickets,
  putTicket,
  deleteTicket,
  patchState,
  patchPriority,
  closeTicket,
  addRequester,
  addAssignees,
  removeRequester,
  removeAssignee,
  removeArea,
} from "../controllers/tickets.controller.js";

export const router = Router();

//Roles: 1 Usuario, 2 Soporte, 3 Administrador

//CRUD
//Acepta query params: page, limit, state_id, priority_id, category_id, office_id, search, sort, order
router.get("/", authMiddleware, getTickets);
router.get("/:id", authMiddleware, validateIds, getTicketById);
router.get("/:id/details", authMiddleware, validateIds, getTicketDetailsById);
router.post("/", authMiddleware, createTickets);
router.put(
  "/:id",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  putTicket,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizationMiddleware(3),
  validateIds,
  deleteTicket,
);

//Estado, prioridad y cierre
router.patch(
  "/:id/state",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  patchState,
);
router.patch(
  "/:id/priority",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  patchPriority,
);
//Cualquier rol: el permiso del Usuario se revisa en el service
router.patch("/:id/close", authMiddleware, validateIds, closeTicket);

//Solicitantes y asignados
router.post(
  "/:id/requesters",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  addRequester,
);
router.post(
  "/:id/assignees",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  addAssignees,
);

//Desasignar
router.delete(
  "/:id/requesters/:userId",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  removeRequester,
);
router.delete(
  "/:id/assignees/users/:userId",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  removeAssignee,
);
router.delete(
  "/:id/assignees/areas/:areaId",
  authMiddleware,
  authorizationMiddleware(2, 3),
  validateIds,
  removeArea,
);
