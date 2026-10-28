import TicketService from "../services/tickets.service.js";
import { PG_ERRORS } from "../utils/pgErrors.js";
import { isValidId } from "../utils/validators.js";
const ticketService = new TicketService();

const getTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getTickets(req.user);
    return res.status(200).send({ payload: tickets });
  } catch (error) {
    console.log("Error al obtener todos los tickets");
    return res.status(500).send({ error: "Error interno al obtener tickets" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await ticketService.getTicketById(id, req.user);
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
    const ticket = await ticketService.getTicketDetailsById(id, req.user);
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
    if (!isValidId(category_id)) {
      return res.status(400).send({ error: "La categoria no es valida" });
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
    if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
      return res.status(400).send({ error: "La categoria no existe" });
    }
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
    if (
      !isValidId(category_id) ||
      !isValidId(priority_id) ||
      !isValidId(state_id)
    ) {
      return res
        .status(400)
        .send({ error: "La categoria, prioridad o estado no es valido" });
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
    if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
      return res
        .status(400)
        .send({ error: "La categoria, prioridad o estado no existe" });
    }
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
        .send({ error: "No se encontro el ticket a eliminar" });
    }
    return res.status(200).send({ payload: ticketDeleted });
  } catch (error) {
    console.log("Error deleteTicket controller");

    return res.status(500).send({ error: "Error al eliminar ticket" });
  }
};

//Assignees and Requester
//Como predeterminado se asigna requester al creador
const addRequester = async (req, res) => {
  try {
    const id = req.params.id;
    const { idUser } = req.body;
    if (!id || !idUser) {
      return res.status(400).send({ error: "Faltan datos!" });
    }
    if (!isValidId(idUser)) {
      return res.status(400).send({ error: "El usuario no es valido" });
    }
    const requester = await ticketService.addRequester(id, idUser);
    if (!requester) {
      return res.status(404).send({ error: "No se encontro el ticket!" });
    }
    return res.status(200).send({ payload: requester });
  } catch (error) {
    if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
      return res.status(409).send({ error: "El usuario ya es solicitante" });
    }
    if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
      return res.status(400).send({ error: "El usuario no existe" });
    }
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error del server al insertar requester" });
  }
};

const addAssignees = async (req, res) => {
  try {
    const id = req.params.id;
    const { userIds = [], areaIds = [] } = req.body;
    if (!Array.isArray(userIds) || !Array.isArray(areaIds)) {
      return res
        .status(400)
        .send({ error: "userIds y areaIds tienen que ser arrays" });
    }
    if (!id || (userIds.length === 0 && areaIds.length === 0)) {
      return res.status(400).send({ error: "Faltan datos!" });
    }
    if (!userIds.every(isValidId) || !areaIds.every(isValidId)) {
      return res.status(400).send({ error: "Hay IDs que no son validos" });
    }
    const result = await ticketService.addAssignees(id, userIds, areaIds);
    if (!result) {
      return res.status(404).send({ error: "No se encontro el ticket!" });
    }
    return res.status(200).send({ payload: result });
  } catch (error) {
    if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
      return res
        .status(400)
        .send({ error: "Algun usuario o area no existe, no se asigno nada" });
    }
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error del server al asignar el ticket" });
  }
};

//Desasignar
const removeRequester = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const removed = await ticketService.removeRequester(id, userId);
    if (!removed) {
      return res
        .status(404)
        .send({ error: "El usuario no es solicitante de ese ticket" });
    }
    return res.status(200).send({ payload: removed });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error del server al quitar el solicitante" });
  }
};

const removeAssignee = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const removed = await ticketService.removeAssignee(id, userId);
    if (!removed) {
      return res
        .status(404)
        .send({ error: "El usuario no esta asignado a ese ticket" });
    }
    return res.status(200).send({ payload: removed });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error del server al desasignar el usuario" });
  }
};

const removeArea = async (req, res) => {
  try {
    const { id, areaId } = req.params;
    const removed = await ticketService.removeArea(id, areaId);
    if (!removed) {
      return res
        .status(404)
        .send({ error: "El area no esta asignada a ese ticket" });
    }
    return res.status(200).send({ payload: removed });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error del server al desasignar el area" });
  }
};

export {
  getTickets,
  getTicketById,
  getTicketDetailsById,
  createTickets,
  putTicket,
  deleteTicket,
  addRequester,
  addAssignees,
  removeRequester,
  removeAssignee,
  removeArea,
};
