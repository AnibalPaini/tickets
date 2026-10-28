import CategoryService from "../services/categories.service.js";
import { PG_ERRORS } from "../utils/pgErrors.js";
const categoryService = new CategoryService();

const isValidCategory = (category) =>
  typeof category === "string" && category.trim() !== "";

const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();
    return res.status(200).send({ payload: categories });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al obtener categorias" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).send({ error: "No se encontro la categoria!" });
    }
    return res.status(200).send({ payload: category });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Error interno al obtener categoria" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!isValidCategory(category)) {
      return res
        .status(400)
        .send({ error: "Falta el nombre de la categoria!" });
    }
    const categoryCreated = await categoryService.createCategory(
      category.trim(),
    );
    return res.status(201).send({ payload: categoryCreated });
  } catch (error) {
    if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
      return res.status(409).send({ error: "Ya existe esa categoria" });
    }
    console.error(error);
    return res.status(500).send({ error: "Error interno al crear categoria" });
  }
};

const putCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { category } = req.body;
    if (!isValidCategory(category)) {
      return res
        .status(400)
        .send({ error: "Falta el nombre de la categoria!" });
    }
    const categoryUpdated = await categoryService.putCategory(
      id,
      category.trim(),
    );
    if (!categoryUpdated) {
      return res.status(404).send({ error: "No se encontro la categoria!" });
    }
    return res.status(200).send({ payload: categoryUpdated });
  } catch (error) {
    if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
      return res.status(409).send({ error: "Ya existe esa categoria" });
    }
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al actualizar categoria" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryDeleted = await categoryService.deleteCategory(id);
    if (!categoryDeleted) {
      return res.status(404).send({ error: "No se encontro la categoria!" });
    }
    return res.status(200).send({ payload: categoryDeleted });
  } catch (error) {
    if (error.code === PG_ERRORS.FOREIGN_KEY_VIOLATION) {
      return res
        .status(409)
        .send({ error: "La categoria tiene tickets, no se puede eliminar" });
    }
    console.error(error);
    return res
      .status(500)
      .send({ error: "Error interno al eliminar categoria" });
  }
};

export {
  getCategories,
  getCategoryById,
  createCategory,
  putCategory,
  deleteCategory,
};
