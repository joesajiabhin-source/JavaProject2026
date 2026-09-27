-- Runs only with the test profile against TEST_MYSQL_URL.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE loan_history;
TRUNCATE TABLE books;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
