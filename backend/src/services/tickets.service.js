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
    return await ticketRepo.addRequester(ticketId, userId);
  };
}
