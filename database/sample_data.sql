-- Sample data for Library Management System
USE library_management;

-- Insert sample students (password is 'password123' hashed)
INSERT INTO STUDENT (FirstName, LastName, Year, Course, Email, Password, Role) VALUES
('John', 'Doe', '2024', 'Computer Science', 'john.doe@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Jane', 'Smith', '2023', 'Information Technology', 'jane.smith@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Admin', 'User', '2024', 'Library Science', 'admin@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Alice', 'Johnson', '2022', 'Mathematics', 'alice.johnson@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Bob', 'Wilson', '2024', 'Physics', 'bob.wilson@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- Insert sample books
INSERT INTO BOOKS (Book_Name, Author, Year_Published, ISBN, Available_Copies, Total_Copies, Category) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', 2009, '978-0262033848', 3, 5, 'Computer Science'),
('Clean Code', 'Robert C. Martin', 2008, '978-0132350884', 2, 3, 'Programming'),
('Database System Concepts', 'Abraham Silberschatz', 2019, '978-0078022159', 4, 4, 'Database'),
('Computer Networks', 'Andrew S. Tanenbaum', 2010, '978-0132126953', 2, 3, 'Networking'),
('Operating System Concepts', 'Abraham Silberschatz', 2018, '978-1118063330', 3, 4, 'Operating Systems'),
('Data Structures and Algorithms in Java', 'Robert Lafore', 2017, '978-0672324536', 2, 2, 'Programming'),
('The Pragmatic Programmer', 'David Thomas', 2019, '978-0135957059', 1, 2, 'Programming'),
('Computer Organization and Design', 'David A. Patterson', 2020, '978-0128122754', 3, 3, 'Computer Architecture'),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', 2020, '978-0134610993', 2, 3, 'AI/ML'),
('Software Engineering', 'Ian Sommerville', 2015, '978-0133943030', 1, 2, 'Software Engineering');

-- Insert sample borrowing records
INSERT INTO RECORDS (Student_Id, Book_Id, Date_Borrowed, Date_Due, Date_Returned, Status) VALUES
(1, 1, '2024-08-01', '2024-08-15', '2024-08-14', 'returned'),
(2, 2, '2024-08-05', '2024-08-19', NULL, 'borrowed'),
(1, 3, '2024-08-10', '2024-08-24', NULL, 'borrowed'),
(4, 4, '2024-08-12', '2024-08-26', NULL, 'borrowed'),
(5, 5, '2024-08-15', '2024-08-29', NULL, 'borrowed'),
(2, 6, '2024-07-20', '2024-08-03', NULL, 'overdue'),
(4, 7, '2024-08-18', '2024-09-01', NULL, 'borrowed');

-- Update available copies based on current borrowings
UPDATE BOOKS SET Available_Copies = Total_Copies - (
    SELECT COUNT(*) FROM RECORDS 
    WHERE RECORDS.Book_Id = BOOKS.Book_Id 
    AND RECORDS.Status IN ('borrowed', 'overdue')
) WHERE Book_Id IN (SELECT DISTINCT Book_Id FROM RECORDS WHERE Status IN ('borrowed', 'overdue'));
