import TicketService from "../services/tickets.service.js";
const ticketService = new TicketService();

const getTickets = async (req, res) => {
  try {
  } catch (error) {}
};
const getTicketById = async (req, res) => {
  try {
  } catch (error) {}
};

const createTickets = async (req, res) => {
  try {
    const user = req.user;

    const { title, description, category_id, requester_id } = req.body;

    if (!title || !description || !category_id) {
      return res.status(400).send({
        error: "Faltan datos obligatorios",
      });
    }

    const ticket = {
      title,
      description,
      category_id,
      state_id: 1,
      priority_id: 1,
      created_by: user.id,
    };

    // Crear ticket...
    const ticketCreated = await ticketService.createTicket(ticket);
    if (!ticketCreated) {
      return res.status(400).send({ error: "Error al crear ticket!" });
    }
    await ticketService.addRequester(ticketCreated.id, user.id);
    
    return res.status(201).send({ payload: ticketCreated });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: "Error al crear el ticket",
    });
  }
};

const putTicket = async (req, res) => {
  try {
  } catch (error) {}
};

const deleteTicket = async (req, res) => {
  try {
  } catch (error) {}
};
