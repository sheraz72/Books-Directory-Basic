"use strict";

var registerUserQuery = "INSERT INTO USERS (u_name,email,role,password) VALUES (?)";
var loginUserQuery = "SELECT * FROM USERS WHERE email = ?";
var showUsersQuery = "SELECT user_id, u_name, email, role, user_status FROM USERS"; //MAX function to the non-aggregated columns in the SELECT clause to ensure that they're 
//compatible with the GROUP BY clause and the ONLY_FULL_GROUP_BY mode.
// the MAX function is used to select the latest/current record for the user's current borrowing.

var getAllUsersDetailsQuery = "\nSELECT\n    u.user_id,\n    u.u_name,\n    u.email,\n    u.role,\n    total_borrowed.total_borrowed_books,\n    GROUP_CONCAT(DISTINCT br.book_id) AS borrowed_book_ids,\n    GROUP_CONCAT(DISTINCT bo.b_name) AS borrowed_book_titles,\n    GROUP_CONCAT(DISTINCT br.borrowed_at) AS borrowed_at,\n    GROUP_CONCAT(DISTINCT br.due_date) AS due_dates,\n    GROUP_CONCAT(DISTINCT br.status) AS borrow_statuses,\n    SUM(br.Fine) AS pending_fine\nFROM\n    users u\nLEFT JOIN (\n    SELECT user_id, COUNT(*) AS total_borrowed_books\n    FROM borrowing\n    WHERE status = 'Pending'\n    GROUP BY user_id\n) total_borrowed ON u.user_id = total_borrowed.user_id\nLEFT JOIN\n    borrowing br ON u.user_id = br.user_id AND br.status = 'Pending'\nLEFT JOIN\n    books bo ON br.book_id = bo.book_id\nGROUP BY\n    u.user_id, u.u_name, u.email, u.role, total_borrowed.total_borrowed_books;\n    ";
var getUserDetailQuery = "\nSELECT\n    u.user_id,\n    u.u_name,\n    u.email,\n    u.role,\n    total_borrowed.total_borrowed_books,\n    GROUP_CONCAT(DISTINCT br.book_id) AS borrowed_book_ids,\n    GROUP_CONCAT(DISTINCT bo.b_name) AS borrowed_book_titles,\n    GROUP_CONCAT(DISTINCT br.borrowed_at) AS borrowed_dates,\n    GROUP_CONCAT(DISTINCT br.due_date) AS due_dates,\n    GROUP_CONCAT(DISTINCT br.status) AS borrow_statuses,\n    SUM(br.Fine) AS pending_fine\nFROM\n    users u\nLEFT JOIN (\n    SELECT user_id, COUNT(*) AS total_borrowed_books\n    FROM borrowing\n    WHERE status = 'Pending'\n    GROUP BY user_id\n) total_borrowed ON u.user_id = total_borrowed.user_id\nLEFT JOIN\n    borrowing br ON u.user_id = br.user_id AND br.status = 'Pending'\nLEFT JOIN\n    books bo ON br.book_id = bo.book_id\nWHERE\n    u.u_name LIKE ?\nGROUP BY\n    u.user_id, u.u_name, u.email, u.role, total_borrowed.total_borrowed_books;";
var addAuthors = "INSERT INTO Authors (a_name, age) VALUES (?)";
var authorDetails = "SELECT author_id, a_name, age from authors";
var checkAuthorQuery = "SELECT * FROM Authors WHERE a_name = ? ";
var authorDetailsWithMaxBooksQuery = "SELECT  a.author_id, a.a_name, COUNT(ba.author_id) AS num_books\n                                          FROM authors AS a\n                                          JOIN book_author AS ba ON a.author_id = ba.author_id\n                                          GROUP BY a.author_id\n                                          ORDER BY num_books desc\n                                          LIMIT 1;\n                                          ";
var insertBookQuery = "INSERT INTO BOOKS (b_name, genre) VALUES (?)";
var insertBookAuthorQuery = "INSERT INTO book_author (book_id, author_id) VALUES (?,?)";
var checkAuthorBookExists = "SELECT * FROM book_author WHERE book_id = ? AND author_id = ?";
var delBookQuery = "DELETE ba.*, b.* FROM book_author AS ba JOIN books AS b ON ba.book_id = b.book_id WHERE b.b_name = ?";
var getBooksQuery = "SELECT book_id, b_name, genre, author_id FROM BOOKS WHERE b_name LIKE ? OR author_id = ? OR genre LIKE ? LIMIT 10";
var updateBookQuery = "\n  UPDATE BOOKS SET b_name = ?, author_id = ?, genre = ? WHERE book_id = ?;";
var updateBookAuthorQuery = "UPDATE book_author SET author_id = ?, book_id = ?  WHERE book_id = ?";
var BookAvailabilityQuery = "SELECT * FROM BOOKS WHERE b_name = ?";
var borrowBookQuery = "INSERT INTO BORROWING (book_id, user_id, borrowed_at, due_date) VALUES (?)";
var checkIfAlreadyBorrowedQuery = "SELECT * FROM BORROWING WHERE Book_ID = ? AND status = 'Pending'";
var updateBorrowBookQuery = "UPDATE BORROWING SET user_id = ?, borrowed_at = ?, due_date = ?, status = 'Pending' WHERE book_id = ?";
var checkFineQuery = "SELECT * FROM borrowing WHERE user_id = ? AND status = 'Pending'";
var checkAllUserFineQuery = "SELECT * FROM borrowing WHERE status = 'Pending'";
var updateFineQuery = "UPDATE borrowing SET Fine = TIMESTAMPDIFF(DAY, due_date, NOW()) * 100 WHERE status = 'Pending' AND TIMESTAMPDIFF(DAY, due_date, NOW()) > 0;";
var banUser = "UPDATE users\n                 SET user_status = 'Banned'\n                 WHERE user_id IN (\n                                    SELECT DISTINCT b.user_id\n                                    FROM borrowing b\n                                    WHERE b.status = 'Pending' AND TIMESTAMPDIFF(DAY, b.due_date, NOW()) > 7\n                                  );\n";
var isUserBannedQuery = "SELECT user_status, user_id FROM users WHERE u_name LIKE ?";
var getAllBooksQuery = "SELECT\n                              (SELECT COUNT(*) FROM books) AS total_books,\n                              b.b_name AS book_name,\n                              b.author_id AS author_id,\n                              b.genre AS genre,\n                              IFNULL(bo.user_id, 0) AS borrower_id,\n                              bo.borrowed_at AS borrowed_at,\n                              bo.due_date AS due_date,\n                              bo.status AS borrow_status\n                          FROM\n                              books AS b\n                          LEFT JOIN borrowing AS bo ON b.book_id = bo.book_id\n                          ORDER BY\n                              b.book_id;\n";
var getBookAuthorDetailsQuery = "SELECT\n                                  a.author_id,\n                                  a.a_name AS author_name,\n                                  a.age AS author_age,\n                                  COUNT(ba.book_id) AS total_books_written,\n                                  GROUP_CONCAT(DISTINCT b.b_name ORDER BY b.b_name ASC) AS books_written\n                              FROM\n                                  authors AS a\n                              JOIN book_author AS ba ON a.author_id = ba.author_id\n                              JOIN books AS b ON ba.book_id = b.book_id\n                              GROUP BY\n                                  a.author_id, a.a_name, a.age\n                              ORDER BY\n                                  a.author_id;";
var getAuthorDetailsQuery = "SELECT\n                                    a.author_id,\n                                    a.a_name AS author_name,\n                                    a.age AS author_age,\n                                    COUNT(ba.book_id) AS total_books_written,\n                                    GROUP_CONCAT(DISTINCT b.b_name ORDER BY b.b_name ASC) AS books_written\n                                FROM\n                                    authors AS a\n                                JOIN book_author AS ba ON a.author_id = ba.author_id\n                                JOIN books AS b ON ba.book_id = b.book_id\n                                WHERE \n                                    a.author_id LIKE ?\n                                GROUP BY\n                                    a.author_id, a.a_name, a.age\n                                ";
var checkIfBorrowBookQuery = "SELECT * FROM BORROWING WHERE Book_ID = ? AND user_id = ?";
var returnBookQuery = "UPDATE borrowing SET status = 'Returned', Fine = 0 WHERE book_id = ? AND user_id = ?";
var updateBookAvailabilityQuery = "UPDATE BOOKS SET STATUS = 'Not Available' WHERE BID = ?";
module.exports = {
  registerUserQuery: registerUserQuery,
  loginUserQuery: loginUserQuery,
  addAuthors: addAuthors,
  showUsersQuery: showUsersQuery,
  getAllUsersDetailsQuery: getAllUsersDetailsQuery,
  getUserDetailQuery: getUserDetailQuery,
  authorDetails: authorDetails,
  authorDetailsWithMaxBooksQuery: authorDetailsWithMaxBooksQuery,
  insertBookQuery: insertBookQuery,
  checkAuthorQuery: checkAuthorQuery,
  getBooksQuery: getBooksQuery,
  updateBookQuery: updateBookQuery,
  updateBookAuthorQuery: updateBookAuthorQuery,
  delBookQuery: delBookQuery,
  BookAvailabilityQuery: BookAvailabilityQuery,
  checkIfAlreadyBorrowedQuery: checkIfAlreadyBorrowedQuery,
  borrowBookQuery: borrowBookQuery,
  checkFineQuery: checkFineQuery,
  insertBookAuthorQuery: insertBookAuthorQuery,
  checkAuthorBookExists: checkAuthorBookExists,
  updateBookAvailabilityQuery: updateBookAvailabilityQuery,
  updateFineQuery: updateFineQuery,
  checkAllUserFineQuery: checkAllUserFineQuery,
  getAllBooksQuery: getAllBooksQuery,
  getBookAuthorDetailsQuery: getBookAuthorDetailsQuery,
  getAuthorDetailsQuery: getAuthorDetailsQuery,
  checkIfBorrowBookQuery: checkIfBorrowBookQuery,
  updateBorrowBookQuery: updateBorrowBookQuery,
  returnBookQuery: returnBookQuery,
  banUser: banUser,
  isUserBannedQuery: isUserBannedQuery
};