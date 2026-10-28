import AttachmentRepo from "../repository/attachments.repository.js";
import TicketService from "./tickets.service.js";
import { deleteUploadedFile } from "../utils/files.js";
const attachmentRepo = new AttachmentRepo();
const ticketService = new TicketService();

export default class AttachmentService {
  //Ver adjuntos: mismo criterio que ver el ticket. Devuelve null si no existe o no lo puede ver
  getAttachments = async (ticketId, user) => {
    const ticket = await ticketService.getTicketById(ticketId, user);
    if (!ticket) {
      return null;
    }
    return await attachmentRepo.findByTicketId(ticketId);
  };

  getAttachment = async (ticketId, attachmentId, user) => {
    const ticket = await ticketService.getTicketById(ticketId, user);
    if (!ticket) {
      return null;
    }
    return await attachmentRepo.findById(ticketId, attachmentId);
  };

  //Subir adjuntos: mismo criterio que responder
  //Devuelve null si no existe el ticket, false si no puede y true si puede
  canAttach = async (ticketId, user) => {
    return await ticketService.canParticipate(ticketId, user);
  };

  createAttachments = async (ticketId, userId, files) => {
    return await attachmentRepo.createMany(ticketId, userId, files);
  };

  deleteAttachment = async (attachmentId) => {
    const attachment = await attachmentRepo.delete(attachmentId);
    if (attachment) {
      await deleteUploadedFile(attachment.file_name);
    }
    return attachment;
  };

  //Para cuando multer ya guardo los archivos pero el request no sigue (ej: sin permiso)
  discardUploadedFiles = async (files = []) => {
    for (const file of files) {
      await deleteUploadedFile(file.filename);
    }
  };
}
