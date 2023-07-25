const registerUserQuery =
  "INSERT INTO USERS (U_NAME,EMAIL,ROLE,PASSWORD) VALUES (?)";
const loginUserQuery = "SELECT * FROM USERS WHERE EMAIL = ?";
const insertBookQuery = "INSERT INTO BOOKS (BNAME, AUTHORS, GENRE) VALUES (?)";
const getBooksQuery =
  "SELECT * FROM BOOKS WHERE BNAME = ? OR AUTHORS = ? OR GENRE = ?";
const delBookQuery =
  "DELETE FROM BOOKS WHERE BID = ? OR BNAME = ? OR AUTHORS = ? OR GENRE = ?";
const updateBookQuery =
  "UPDATE BOOKS SET BNAME = ?, AUTHORS = ?, GENRE = ? WHERE BID = ?";

module.exports = {
  registerUserQuery,
  loginUserQuery,
  insertBookQuery,
  getBooksQuery,
  delBookQuery,
  updateBookQuery,
};
