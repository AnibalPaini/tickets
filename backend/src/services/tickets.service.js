import TicketRepo from "../repository/tickets.repository.js";
const ticketRepo = new TicketRepo();
export default class TicketService {
  getTickets = async () => {};
  getTicketById = async () => {};
  createTicket = async (datos) => {
    try {
      return await ticketRepo.create(datos);
    } catch (error) {
      throw error;
    }
  };
  putTicket = async () => {};
  deleteTicket = async () => {};

  //Solicitantes y asignados

  addRequester = async (ticketId, userId) => {
    return await ticketRepo.addRequester(ticketId, userId);
  };
}
