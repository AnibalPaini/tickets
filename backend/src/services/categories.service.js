import CategoryRepo from "../repository/categories.repository.js";
const categoryRepo = new CategoryRepo();
export default class CategoryService {
  getCategories = async () => {
    return await categoryRepo.findAll();
  };

  getCategoryById = async (id) => {
    return await categoryRepo.findById(id);
  };

  createCategory = async (category) => {
    return await categoryRepo.create(category);
  };

  //Si no existe la categoria el update devuelve null
  putCategory = async (id, category) => {
    return await categoryRepo.update(id, category);
  };

  deleteCategory = async (id) => {
    return await categoryRepo.delete(id);
  };
}
