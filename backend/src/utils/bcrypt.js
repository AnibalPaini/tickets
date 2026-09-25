import bcrypt from "bcrypt";

export const hashPassword = (password) => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = (password, hashPassword) => {
  return bcrypt.compare(password, hashPassword);
};