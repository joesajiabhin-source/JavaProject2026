-- Seed Users
INSERT INTO users (name, contact, role) VALUES ('Maya Patel', 'maya@example.com', 'READER');
INSERT INTO users (name, contact, role) VALUES ('Noah Williams', 'noah@example.com', 'READER');
INSERT INTO users (name, contact, role) VALUES ('Aarav Shah', 'aarav@example.com', 'READER');

-- Seed Books
-- 1: The Midnight Library (available)
INSERT INTO books (title, author, isbn, genre, status, borrower_id, due_date, renewed, on_hold)
VALUES ('The Midnight Library', 'Matt Haig', '9780525559498', 'Fiction', 'available', NULL, NULL, FALSE, FALSE);

-- 2: Atomic Habits (borrowed by Maya - id 1, on time, due in 14 days)
INSERT INTO books (title, author, isbn, genre, status, borrower_id, due_date, renewed, on_hold)
VALUES ('Atomic Habits', 'James Clear', '9780735211292', 'Self-growth', 'borrowed', 1, DATEADD('DAY', 14, CURRENT_DATE), FALSE, FALSE);

-- 3: Sapiens (borrowed by Noah - id 2, 3 days overdue, renewed, on hold)
INSERT INTO books (title, author, isbn, genre, status, borrower_id, due_date, renewed, on_hold)
VALUES ('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 'borrowed', 2, DATEADD('DAY', -3, CURRENT_DATE), TRUE, TRUE);

-- 4: The Design of Everyday Things (available)
INSERT INTO books (title, author, isbn, genre, status, borrower_id, due_date, renewed, on_hold)
VALUES ('The Design of Everyday Things', 'Don Norman', '9780465050659', 'Design', 'available', NULL, NULL, FALSE, FALSE);

-- 5: A Brief History of Time (available)
INSERT INTO books (title, author, isbn, genre, status, borrower_id, due_date, renewed, on_hold)
VALUES ('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 'available', NULL, NULL, FALSE, FALSE);
