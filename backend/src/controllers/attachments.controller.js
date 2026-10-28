import AttachmentService from "../services/attachments.service.js";
import { ROLES } from "../utils/roles.js";
import { getUploadPath } from "../utils/files.js";
const attachmentService = new AttachmentService();

//file_name es el nombre interno en disco, no se le muestra al cliente
const toPublic = ({ file_name, ...attachment }) => attachment;

const getAttachments = async (req, res) => {
  try {
    const id = req.params.id;
    const attachments = await attachmentService.getAttachments(id, req.user);
    if (!attachments) {
      return res.status(404).send({ error: "No se encontro el ticket!" });
    }
    return res.status(200).send({ payload: attachments.map(toPublic) });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al obtener los adjuntos" });
  }
};

//multipart/form-data con los archivos en el campo "files"
//Cuando llega aca multer ya guardo los archivos en disco (req.files)
const uploadAttachments = async (req, res) => {
  const files = req.files || [];
  try {
    const id = req.params.id;
    if (files.length === 0) {
      return res
        .status(400)
        .send({ error: 'No se envio ningun archivo en el campo "files"' });
    }
    const canAttach = await attachmentService.canAttach(id, req.user);
    if (canAttach === null) {
      await attachmentService.discardUploadedFiles(files);
      return res.status(404).send({ error: "No se encontro el ticket!" });
    }
    if (!canAttach) {
      await attachmentService.discardUploadedFiles(files);
      return res.status(403).send({
        error: "Solo pueden adjuntar el solicitante y los asignados",
      });
    }
    const attachments = await attachmentService.createAttachments(
      id,
      req.user.id,
      files,
    );
    return res.status(201).send({ payload: attachments });
  } catch (error) {
    await attachmentService.discardUploadedFiles(files);
    console.error(error);
    return res.status(500).send({ error: "Error interno al subir adjuntos" });
  }
};

//Descarga el archivo con su nombre original
const downloadAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const attachment = await attachmentService.getAttachment(
      id,
      attachmentId,
      req.user,
    );
    if (!attachment) {
      return res.status(404).send({ error: "No se encontro el adjunto!" });
    }
    //res.download lo manda como descarga (Content-Disposition: attachment), el navegador
    //no lo abre como pagina. nosniff: que el navegador no adivine otro tipo de archivo
    res.download(
      getUploadPath(attachment.file_name),
      attachment.original_name,
      {
        headers: {
          "Content-Type": attachment.mime_type,
          "X-Content-Type-Options": "nosniff",
        },
      },
      (error) => {
        if (error && !res.headersSent) {
          console.error(error);
          res
            .status(404)
            .send({ error: "El archivo no se encontro en el servidor" });
        }
      },
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al descargar el adjunto" });
  }
};

//Puede borrar el que lo subio o un administrador
const deleteAttachment = async (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    const user = req.user;
    const attachment = await attachmentService.getAttachment(
      id,
      attachmentId,
      user,
    );
    if (!attachment) {
      return res.status(404).send({ error: "No se encontro el adjunto!" });
    }
    if (attachment.user_id !== user.id && user.rol_id !== ROLES.ADMIN) {
      return res.status(403).send({ error: "No autorizado" });
    }
    const attachmentDeleted =
      await attachmentService.deleteAttachment(attachmentId);
    return res.status(200).send({ payload: toPublic(attachmentDeleted) });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al eliminar el adjunto" });
  }
};

export {
  getAttachments,
  uploadAttachments,
  downloadAttachment,
  deleteAttachment,
};
