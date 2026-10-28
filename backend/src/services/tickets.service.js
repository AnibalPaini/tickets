import TicketRepo from "../repository/tickets.repository.js";
import { ROLES } from "../utils/roles.js";
const ticketRepo = new TicketRepo();
export default class TicketService {
  //El Usuario solo ve los tickets donde participa, Soporte y Admin ven todos
  canView = async (ticketId, user) => {
    if (user.rol_id !== ROLES.USUARIO) {
      return true;
    }
    return await ticketRepo.isParticipant(ticketId, user.id);
  };

  getTickets = async (user) => {
    if (user.rol_id === ROLES.USUARIO) {
      return ticketRepo.findByParticipant(user.id);
    }
    return ticketRepo.findAll();
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

  deleteTicket = async (id) => {
    return await ticketRepo.delete(id)
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
