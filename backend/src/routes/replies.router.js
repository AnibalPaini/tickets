import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import {
  getReplies,
  createReply,
  putReply,
  deleteReply,
} from "../controllers/replies.controller.js";

//mergeParams: para poder leer el :id del ticket que viene de app.js
export const router = Router({ mergeParams: true });

//validateIds revisa tanto el :id del ticket como el :replyId
router.get("/", authMiddleware, validateIds, getReplies);
router.post("/", authMiddleware, validateIds, createReply);
router.put("/:replyId", authMiddleware, validateIds, putReply);
router.delete("/:replyId", authMiddleware, validateIds, deleteReply);
