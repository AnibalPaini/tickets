import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateIds } from "../middlewares/validateIds.middleware.js";
import { uploadFiles } from "../middlewares/upload.middleware.js";
import {
  getAttachments,
  uploadAttachments,
  downloadAttachment,
  deleteAttachment,
} from "../controllers/attachments.controller.js";

//mergeParams: para poder leer el :id del ticket que viene de app.js
export const router = Router({ mergeParams: true });

//Los permisos se revisan en el service (mismo criterio que ver y responder el ticket)
router.get("/", authMiddleware, validateIds, getAttachments);
router.post("/", authMiddleware, validateIds, uploadFiles, uploadAttachments);
router.get("/:attachmentId", authMiddleware, validateIds, downloadAttachment);
router.delete("/:attachmentId", authMiddleware, validateIds, deleteAttachment);
