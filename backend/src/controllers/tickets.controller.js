import TicketService from "../services/tickets.service.js";
const ticketService = new TicketService();

const getTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getTickets();
    return res.status(200).send({ payload: tickets });
  } catch (error) {
    console.log("Error al obtener todos los tickets");
    return res.status(500).send({ error: "Error interno al obtener tickets" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).send({ error: "No se encontro ticket." });
    }
    return res.status(200).send({ payload: ticket });
  } catch (error) {
    console.log("Error al obtener ticket por id");
    return res.status(500).send({ error: "Error interno al obtener ticket" });
  }
};

const getTicketDetailsById = async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await ticketService.getTicketDetailsById(id);
    if (!ticket) {
      return res.status(404).send({ error: "No se encontro ticket." });
    }
    return res.status(200).send({ payload: ticket });
  } catch (error) {
    console.log("Error al obtener todo el ticket por id");
    return res.status(500).send({ error: "Error interno al obtener ticket" });
  }
};

const createTickets = async (req, res) => {
  try {
    const user = req.user;

    const { title, description, category_id } = req.body;

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
    const id = req.params.id;
    const { title, description, category_id, priority_id, state_id } = req.body;
    if (!title || !description || !category_id || !priority_id || !state_id) {
      return res
        .status(400)
        .send({ error: "No se pasaron los campos obligatorios" });
    }
    let datos = { title, description, category_id, priority_id, state_id };
    if (!id) {
      return res.status(400).send({ error: "No se obtuvo el ID" });
    }
    const ticketUpdated = await ticketService.putTicket(id, datos);
    if (!ticketUpdated) {
      return res
        .status(404)
        .send({ error: "No se encontro el ticket a actualizar" });
    }
    return res.status(200).send({ payload: ticketUpdated });
  } catch (error) {
    console.log("Error al actualizar un ticket.");
    return res
      .status(500)
      .send({ error: "Error interno al actualizar un ticket" });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send({ error: "No se obtuvo el ID" });
    }
    const ticketDeleted = await ticketService.deleteTicket(id);
    if (!ticketDeleted) {
      return res
        .status(404)
        .send({ error: "No se encontro el ticket a actualizar" });
    }
    return res.status(200).send({ payload: ticketDeleted });
  } catch (error) {}
};

export {
  getTickets,
  getTicketById,
  getTicketDetailsById,
  createTickets,
  putTicket,
  deleteTicket,
};
