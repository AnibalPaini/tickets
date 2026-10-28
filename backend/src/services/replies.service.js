import ReplyRepo from "../repository/replies.repository.js";
import TicketService from "./tickets.service.js";
const replyRepo = new ReplyRepo();
const ticketService = new TicketService();

export default class ReplyService {
  //Mismo criterio que ver el ticket: el Usuario solo si participa
  getReplies = async (ticketId, user) => {
    const ticket = await ticketService.getTicketById(ticketId, user);
    if (!ticket) {
      return null;
    }
    return await replyRepo.findByTicketId(ticketId);
  };

  getReplyById = async (ticketId, replyId) => {
    return await replyRepo.findById(ticketId, replyId);
  };

  //Pueden responder el solicitante, los asignados (usuarios o por area) y el administrador
  //Devuelve null si no existe el ticket, false si no puede responder y true si puede
  canReply = async (ticketId, user) => {
    return await ticketService.canParticipate(ticketId, user);
  };

  createReply = async (ticketId, userId, message) => {
    return await replyRepo.create({
      ticket_id: ticketId,
      user_id: userId,
      message,
    });
  };

  putReply = async (replyId, message) => {
    return await replyRepo.update(replyId, message);
  };

  deleteReply = async (replyId) => {
    return await replyRepo.delete(replyId);
  };
}
