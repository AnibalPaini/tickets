import OfficeService from "../services/offices.service.js";
import { PG_ERRORS } from "../utils/pgErrors.js";
const officeService = new OfficeService();

const isValidOffice = (office) =>
  typeof office === "string" && office.trim() !== "";

const getOffices = async (req, res) => {
  try {
    const offices = await officeService.getOffices();
    return res.status(200).send({ payload: offices });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Error interno al obtener oficinas" });
  }
};

const getOfficeById = async (req, res) => {
  try {
    const id = req.params.id;
    const office = await officeService.getOfficeById(id);
    if (!office) {
      return res.status(404).send({ error: "No se encontro la oficina!" });
    }
    return res.status(200).send({ payload: office });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Error interno al obtener oficina" });
  }
};

const createOffice = async (req, res) => {
  try {
    const { office } = req.body;
    if (!isValidOffice(office)) {
      return res.status(400).send({ error: "Falta el nombre de la oficina!" });
    }
    const officeCreated = await officeService.createOffice(office.trim());
    return res.status(201).send({ payload: officeCreated });
  } catch (error) {
    if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
      return res.status(409).send({ error: "Ya existe esa oficina" });
    }
    console.error(error);
    return res.status(500).send({ error: "Error interno al crear oficina" });
  }
};

const putOffice = async (req, res) => {
  try {
    const id = req.params.id;
    const { office } = req.body;
    if (!isValidOffice(office)) {
      return res.status(400).send({ error: "Falta el nombre de la oficina!" });
    }
    const officeUpdated = await officeService.putOffice(id, office.trim());
    if (!officeUpdated) {
      return res.status(404).send({ error: "No se encontro la oficina!" });
    }
    return res.status(200).send({ payload: officeUpdated });
  } catch (error) {
    if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
      return res.status(409).send({ error: "Ya existe esa oficina" });
    }
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al actualizar oficina" });
  }
};

const deleteOffice = async (req, res) => {
  try {
    const id = req.params.id;
    const officeDeleted = await officeService.deleteOffice(id);
    if (!officeDeleted) {
      return res.status(404).send({ error: "No se encontro la oficina!" });
    }
    return res.status(200).send({ payload: officeDeleted });
  } catch (error) {
    if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
      return res
        .status(409)
        .send({ error: "La oficina tiene usuarios, no se puede eliminar" });
    }
    console.error(error);
    return res.status(500).send({ error: "Error interno al eliminar oficina" });
  }
};

export { getOffices, getOfficeById, createOffice, putOffice, deleteOffice };
