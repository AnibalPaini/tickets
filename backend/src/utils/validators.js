//Maximo de un INTEGER en PostgreSQL
const MAX_INT = 2147483647;

//Un ID valido es un entero positivo, como numero (5) o como texto ("5")
export const isValidId = (value) => {
  const isNumberLike =
    typeof value === "number" ||
    (typeof value === "string" && /^\d+$/.test(value));
  const n = Number(value);
  return isNumberLike && Number.isInteger(n) && n > 0 && n <= MAX_INT;
};
