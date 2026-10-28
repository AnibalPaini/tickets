import ReplyRepo from "../repository/replies.repository.js";
import TicketRepo from "../repository/tickets.repository.js";
import { ROLES } from "../utils/roles.js";
const replyRepo = new ReplyRepo();
const ticketRepo = new TicketRepo();

export default class ReplyService {
  //Mismo criterio que ver el ticket: el Usuario solo si participa
  getReplies = async (ticketId, user) => {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) {
      return null;
    }
    if (
      user.rol_id === ROLES.USUARIO &&
      !(await ticketRepo.isParticipant(ticketId, user.id))
    ) {
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
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) {
      return null;
    }
    if (user.rol_id === ROLES.ADMIN) {
      return true;
    }
    return await ticketRepo.isParticipant(ticketId, user.id);
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
