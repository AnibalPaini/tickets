//Codigos de error de PostgreSQL
export const PG_ERRORS = {
  UNIQUE_VIOLATION: "23505", //Valor repetido en un campo UNIQUE o PRIMARY KEY
  FOREIGN_KEY_VIOLATION: "23503", //El ID referenciado no existe o tiene registros asociados
};
