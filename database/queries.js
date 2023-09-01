const registerUserQuery =
  "INSERT INTO USERS (u_name,email,role,password) VALUES (?)";
const loginUserQuery = "SELECT * FROM USERS WHERE email = ?";
const showUsersQuery = "SELECT user_id, u_name, email, role, user_status FROM USERS";
  
  //MAX function to the non-aggregated columns in the SELECT clause to ensure that they're 
  //compatible with the GROUP BY clause and the ONLY_FULL_GROUP_BY mode.
  // the MAX function is used to select the latest/current record for the user's current borrowing.
const getAllUsersDetailsQuery = `
SELECT
    u.user_id,
    u.u_name,
    u.email,
    u.role,
    total_borrowed.total_borrowed_books,
    GROUP_CONCAT(DISTINCT br.book_id) AS borrowed_book_ids,
    GROUP_CONCAT(DISTINCT bo.b_name) AS borrowed_book_titles,
    GROUP_CONCAT(DISTINCT br.borrowed_at) AS borrowed_at,
    GROUP_CONCAT(DISTINCT br.due_date) AS due_dates,
    GROUP_CONCAT(DISTINCT br.status) AS borrow_statuses,
    SUM(br.Fine) AS pending_fine
FROM
    users u
LEFT JOIN (
    SELECT user_id, COUNT(*) AS total_borrowed_books
    FROM borrowing
    WHERE status = 'Pending'
    GROUP BY user_id
) total_borrowed ON u.user_id = total_borrowed.user_id
LEFT JOIN
    borrowing br ON u.user_id = br.user_id AND br.status = 'Pending'
LEFT JOIN
    books bo ON br.book_id = bo.book_id
GROUP BY
    u.user_id, u.u_name, u.email, u.role, total_borrowed.total_borrowed_books;
    `;


const getUserDetailQuery = `
SELECT
    u.user_id,
    u.u_name,
    u.email,
    u.role,
    total_borrowed.total_borrowed_books,
    GROUP_CONCAT(DISTINCT br.book_id) AS borrowed_book_ids,
    GROUP_CONCAT(DISTINCT bo.b_name) AS borrowed_book_titles,
    GROUP_CONCAT(DISTINCT br.borrowed_at) AS borrowed_dates,
    GROUP_CONCAT(DISTINCT br.due_date) AS due_dates,
    GROUP_CONCAT(DISTINCT br.status) AS borrow_statuses,
    SUM(br.Fine) AS pending_fine
FROM
    users u
LEFT JOIN (
    SELECT user_id, COUNT(*) AS total_borrowed_books
    FROM borrowing
    WHERE status = 'Pending'
    GROUP BY user_id
) total_borrowed ON u.user_id = total_borrowed.user_id
LEFT JOIN
    borrowing br ON u.user_id = br.user_id AND br.status = 'Pending'
LEFT JOIN
    books bo ON br.book_id = bo.book_id
WHERE
    u.u_name LIKE ?
GROUP BY
    u.user_id, u.u_name, u.email, u.role, total_borrowed.total_borrowed_books;`;

const addAuthors = "INSERT INTO Authors (a_name, age) VALUES (?)";
const authorDetails = "SELECT author_id, a_name, age from authors";
const checkAuthorQuery = "SELECT * FROM Authors WHERE a_name = ? ";
const authorDetailsWithMaxBooksQuery = `SELECT  a.author_id, a.a_name, COUNT(ba.author_id) AS num_books
                                          FROM authors AS a
                                          JOIN book_author AS ba ON a.author_id = ba.author_id
                                          GROUP BY a.author_id
                                          ORDER BY num_books desc
                                          LIMIT 1;
                                          `;

const insertBookQuery = "INSERT INTO BOOKS (b_name, genre) VALUES (?)";
const insertBookAuthorQuery = "INSERT INTO book_author (book_id, author_id) VALUES (?,?)";  
const checkAuthorBookExists = "SELECT * FROM book_author WHERE book_id = ? AND author_id = ?";

const delBookQuery = 
"DELETE ba.*, b.* FROM book_author AS ba JOIN books AS b ON ba.book_id = b.book_id WHERE b.b_name = ?";
const getBooksQuery =
  "SELECT book_id, b_name, genre, author_id FROM BOOKS WHERE b_name LIKE ? OR author_id = ? OR genre LIKE ? LIMIT 10";
const updateBookQuery = `
  UPDATE BOOKS SET b_name = ?, author_id = ?, genre = ? WHERE book_id = ?;`;
const updateBookAuthorQuery = "UPDATE book_author SET author_id = ?, book_id = ?  WHERE book_id = ?";
const BookAvailabilityQuery = "SELECT * FROM BOOKS WHERE b_name = ?";

const borrowBookQuery = "INSERT INTO BORROWING (book_id, user_id, borrowed_at, due_date) VALUES (?)";
const checkIfAlreadyBorrowedQuery = "SELECT * FROM BORROWING WHERE Book_ID = ? AND status = 'Pending'";
const updateBorrowBookQuery = "UPDATE BORROWING SET user_id = ?, borrowed_at = ?, due_date = ?, status = 'Pending' WHERE book_id = ?";

const checkFineQuery = "SELECT * FROM borrowing WHERE user_id = ? AND status = 'Pending'";
const checkAllUserFineQuery = "SELECT * FROM borrowing WHERE status = 'Pending'";

const updateFineQuery = "UPDATE borrowing SET Fine = TIMESTAMPDIFF(DAY, due_date, NOW()) * 100 WHERE status = 'Pending' AND TIMESTAMPDIFF(DAY, due_date, NOW()) > 0;"
const banUser = `UPDATE users
                 SET user_status = 'Banned'
                 WHERE user_id IN (
                                    SELECT DISTINCT b.user_id
                                    FROM borrowing b
                                    WHERE b.status = 'Pending' AND TIMESTAMPDIFF(DAY, b.due_date, NOW()) > 7
                                  );
`;

const isUserBannedQuery = `SELECT user_status, user_id FROM users WHERE u_name LIKE ?`;

const getAllBooksQuery = `SELECT
                              (SELECT COUNT(*) FROM books) AS total_books,
                              b.b_name AS book_name,
                              b.author_id AS author_id,
                              b.genre AS genre,
                              IFNULL(bo.user_id, 0) AS borrower_id,
                              bo.borrowed_at AS borrowed_at,
                              bo.due_date AS due_date,
                              bo.status AS borrow_status
                          FROM
                              books AS b
                          LEFT JOIN borrowing AS bo ON b.book_id = bo.book_id
                          ORDER BY
                              b.book_id;
`;


const getBookAuthorDetailsQuery = `SELECT
                                  a.author_id,
                                  a.a_name AS author_name,
                                  a.age AS author_age,
                                  COUNT(ba.book_id) AS total_books_written,
                                  GROUP_CONCAT(DISTINCT b.b_name ORDER BY b.b_name ASC) AS books_written
                              FROM
                                  authors AS a
                              JOIN book_author AS ba ON a.author_id = ba.author_id
                              JOIN books AS b ON ba.book_id = b.book_id
                              GROUP BY
                                  a.author_id, a.a_name, a.age
                              ORDER BY
                                  a.author_id;`;

const getAuthorDetailsQuery = `SELECT
                                    a.author_id,
                                    a.a_name AS author_name,
                                    a.age AS author_age,
                                    COUNT(ba.book_id) AS total_books_written,
                                    GROUP_CONCAT(DISTINCT b.b_name ORDER BY b.b_name ASC) AS books_written
                                FROM
                                    authors AS a
                                JOIN book_author AS ba ON a.author_id = ba.author_id
                                JOIN books AS b ON ba.book_id = b.book_id
                                WHERE 
                                    a.author_id LIKE ?
                                GROUP BY
                                    a.author_id, a.a_name, a.age
                                `;

const checkIfBorrowBookQuery = "SELECT * FROM BORROWING WHERE Book_ID = ? AND user_id = ?";
const returnBookQuery = "UPDATE borrowing SET status = 'Returned', Fine = 0 WHERE book_id = ? AND user_id = ?";

const updateBookAvailabilityQuery =  "UPDATE BOOKS SET STATUS = 'Not Available' WHERE BID = ?";

module.exports = {
  registerUserQuery,
  loginUserQuery,
  addAuthors,
  showUsersQuery, 
  getAllUsersDetailsQuery,
  getUserDetailQuery,

  authorDetails,
  authorDetailsWithMaxBooksQuery,

  insertBookQuery,
  checkAuthorQuery,
  getBooksQuery,
  updateBookQuery,
  updateBookAuthorQuery,
  delBookQuery,

  BookAvailabilityQuery,
  checkIfAlreadyBorrowedQuery,
  borrowBookQuery,
  checkFineQuery,

  insertBookAuthorQuery,
  checkAuthorBookExists,

  updateBookAvailabilityQuery,
  updateFineQuery,
  checkAllUserFineQuery,
  getAllBooksQuery,
  getBookAuthorDetailsQuery,
  getAuthorDetailsQuery,

  checkIfBorrowBookQuery,
  updateBorrowBookQuery,
  returnBookQuery,
  banUser,
  isUserBannedQuery

};
