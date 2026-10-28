import ReplyService from "../services/replies.service.js";
import { ROLES } from "../utils/roles.js";
const replyService = new ReplyService();

const isValidMessage = (message) =>
  typeof message === "string" && message.trim() !== "";

const getReplies = async (req, res) => {
  try {
    const id = req.params.id;
    const replies = await replyService.getReplies(id, req.user);
    if (!replies) {
      return res.status(404).send({ error: "No se encontro el ticket!" });
    }
    return res.status(200).send({ payload: replies });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al obtener las respuestas" });
  }
};

const createReply = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const { message } = req.body;
    if (!isValidMessage(message)) {
      return res.status(400).send({ error: "Falta el mensaje!" });
    }
    const canReply = await replyService.canReply(id, user);
    if (canReply === null) {
      return res.status(404).send({ error: "No se encontro el ticket!" });
    }
    if (!canReply) {
      return res.status(403).send({
        error: "Solo pueden responder el solicitante y los asignados",
      });
    }
    const reply = await replyService.createReply(id, user.id, message.trim());
    return res.status(201).send({ payload: reply });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Error interno al responder ticket" });
  }
};

//Solo el autor puede editar su respuesta
const putReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    const user = req.user;
    const { message } = req.body;
    if (!isValidMessage(message)) {
      return res.status(400).send({ error: "Falta el mensaje!" });
    }
    const reply = await replyService.getReplyById(id, replyId);
    if (!reply) {
      return res.status(404).send({ error: "No se encontro la respuesta!" });
    }
    if (reply.user_id !== user.id) {
      return res
        .status(403)
        .send({ error: "Solo el autor puede editar la respuesta" });
    }
    const replyUpdated = await replyService.putReply(replyId, message.trim());
    return res.status(200).send({ payload: replyUpdated });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al actualizar la respuesta" });
  }
};

//Puede eliminar el autor o un administrador
const deleteReply = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    const user = req.user;
    const reply = await replyService.getReplyById(id, replyId);
    if (!reply) {
      return res.status(404).send({ error: "No se encontro la respuesta!" });
    }
    if (reply.user_id !== user.id && user.rol_id !== ROLES.ADMIN) {
      return res.status(403).send({ error: "No autorizado" });
    }
    const replyDeleted = await replyService.deleteReply(replyId);
    return res.status(200).send({ payload: replyDeleted });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al eliminar la respuesta" });
  }
};

export { getReplies, createReply, putReply, deleteReply };
