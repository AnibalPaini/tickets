import TicketRepo from "../repository/tickets.repository.js";
import AttachmentRepo from "../repository/attachments.repository.js";
import { ROLES } from "../utils/roles.js";
import { STATES } from "../utils/states.js";
import { deleteUploadedFile } from "../utils/files.js";
const ticketRepo = new TicketRepo();
const attachmentRepo = new AttachmentRepo();
export default class TicketService {
  //El Usuario solo ve los tickets donde participa, Soporte y Admin ven todos
  canView = async (ticketId, user) => {
    if (user.rol_id !== ROLES.USUARIO) {
      return true;
    }
    return await ticketRepo.isParticipant(ticketId, user.id);
  };

  //Pueden participar (responder, adjuntar archivos) el solicitante, los asignados
  //(usuarios o por area) y el administrador
  //Devuelve null si no existe el ticket, false si no puede y true si puede
  canParticipate = async (ticketId, user) => {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) {
      return null;
    }
    if (user.rol_id === ROLES.ADMIN) {
      return true;
    }
    return await ticketRepo.isParticipant(ticketId, user.id);
  };

  //options: page, limit, filtros (state_id, priority_id, category_id, office_id), search, sort, order
  getTickets = async (user, options) => {
    const { page, limit } = options;
    const { rows, total } = await ticketRepo.findMany({
      ...options,
      //El Usuario comun solo ve los tickets donde participa
      participantId: user.rol_id === ROLES.USUARIO ? user.id : null,
      offset: (page - 1) * limit,
    });
    return {
      tickets: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  //Si el usuario no puede verlo se devuelve null (404), asi no sabe que existe
  getTicketById = async (id, user) => {
    const ticket = await ticketRepo.findById(id);
    if (!ticket || !(await this.canView(id, user))) {
      return null;
    }
    return ticket;
  };

  getTicketDetailsById = async (id, user) => {
    const ticket = await ticketRepo.getDetailsById(id);
    if (!ticket || !(await this.canView(id, user))) {
      return null;
    }
    return ticket;
  };

  createTicket = async (datos) => {
    try {
      return await ticketRepo.create(datos);
    } catch (error) {
      throw error;
    }
  };

  putTicket = async (id, datos) => {
    const ticket = await ticketRepo.findById(id);
    if (!ticket) {
      return null;
    }
    return await ticketRepo.update(id, datos);
  };

  //Los adjuntos se borran de la DB solos (ON DELETE CASCADE),
  //pero los archivos del disco hay que borrarlos a mano
  deleteTicket = async (id) => {
    const attachments = await attachmentRepo.findByTicketId(id);
    const ticket = await ticketRepo.delete(id);
    if (ticket) {
      for (const attachment of attachments) {
        await deleteUploadedFile(attachment.file_name);
      }
    }
    return ticket;
  };

  //Soporte y Admin. Devuelven null si el ticket no existe
  changeState = async (id, stateId) => {
    return await ticketRepo.updateState(id, stateId);
  };

  changePriority = async (id, priorityId) => {
    return await ticketRepo.updatePriority(id, priorityId);
  };

  //Cerrar: el Usuario puede cerrar los tickets donde participa
  //Devuelve null si no existe o no lo puede ver, false si ya estaba cerrado o cancelado
  closeTicket = async (id, user) => {
    const ticket = await this.getTicketById(id, user);
    if (!ticket) {
      return null;
    }
    if (
      ticket.state_id === STATES.CERRADO ||
      ticket.state_id === STATES.CANCELADO
    ) {
      return false;
    }
    return await ticketRepo.updateState(id, STATES.CERRADO);
  };

  //Solicitantes y asignados

  addRequester = async (ticketId, userId) => {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) {
      return null;
    }
    return await ticketRepo.addRequester(ticketId, userId);
  };

  addAssignees = async (ticketId, userIds, areaIds) => {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) {
      return null;
    }
    return await ticketRepo.addAssignees(ticketId, userIds, areaIds);
  };

  removeRequester = async (ticketId, userId) => {
    return await ticketRepo.removeRequester(ticketId, userId);
  };

  removeAssignee = async (ticketId, userId) => {
    return await ticketRepo.removeAssignee(ticketId, userId);
  };

  removeArea = async (ticketId, areaId) => {
    return await ticketRepo.removeArea(ticketId, areaId);
  };
}
