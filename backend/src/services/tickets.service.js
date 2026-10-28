import TicketRepo from "../repository/tickets.repository.js";
const ticketRepo = new TicketRepo();
export default class TicketService {
  getTickets = async () => {
    return ticketRepo.findAll();
  };

  getTicketById = async (id) => {
    return ticketRepo.findById(id)
  };

  getTicketDetailsById = async (id) => {
    return ticketRepo.getDetailsById(id)
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

    //Si ya estaba asignado el insert devuelve null y no se agrega
    const users = [];
    for (const userId of userIds) {
      const assignee = await ticketRepo.addAssignee(ticketId, userId);
      if (assignee) {
        users.push(assignee);
      }
    }

    const areas = [];
    for (const areaId of areaIds) {
      const area = await ticketRepo.addArea(ticketId, areaId);
      if (area) {
        areas.push(area);
      }
    }

    return { users, areas };
  };
}
