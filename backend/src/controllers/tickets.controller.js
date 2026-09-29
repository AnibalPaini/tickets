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
    const user=req.user;
    const {title, description, category_id, state_id}=req.body;
    if(!title || !description || !category_id || !state_id){
      return res.status(400).send({error:"Faltan datos obligatorios!"})
    }
    const createTicket= await 
  } catch (error) {}
};

const putTicket = async (req, res) => {
  try {
  } catch (error) {}
};

const deleteTicket = async (req, res) => {
  try {
  } catch (error) {}
};


