import OfficeRepo from "../repository/offices.repository.js";
const officeRepo = new OfficeRepo();
export default class OfficeService {
  getOffices = async () => {
    return await officeRepo.findAll();
  };

  getOfficeById = async (id) => {
    return await officeRepo.findById(id);
  };

  createOffice = async (office) => {
    return await officeRepo.create(office);
  };

  //Si no existe la oficina el update devuelve null
  putOffice = async (id, office) => {
    return await officeRepo.update(id, office);
  };

  deleteOffice = async (id) => {
    return await officeRepo.delete(id);
  };
}
