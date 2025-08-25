-- Library Management System Database Schema
-- Database: library_management

CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

-- STUDENT table
CREATE TABLE STUDENT (
    Student_Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Year VARCHAR(10) NOT NULL,
    Course VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('student', 'admin') DEFAULT 'student',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKS table
CREATE TABLE BOOKS (
    Book_Id INT AUTO_INCREMENT PRIMARY KEY,
    Book_Name VARCHAR(200) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    Year_Published YEAR NOT NULL,
    ISBN VARCHAR(20) UNIQUE,
    Available_Copies INT DEFAULT 1,
    Total_Copies INT DEFAULT 1,
    Category VARCHAR(50),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RECORDS table
CREATE TABLE RECORDS (
    Record_Id INT AUTO_INCREMENT PRIMARY KEY,
    Student_Id INT NOT NULL,
    Book_Id INT NOT NULL,
    Date_Borrowed DATE NOT NULL,
    Date_Due DATE NOT NULL,
    Date_Returned DATE NULL,
    Status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_Id) REFERENCES STUDENT(Student_Id) ON DELETE CASCADE,
    FOREIGN KEY (Book_Id) REFERENCES BOOKS(Book_Id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_student_email ON STUDENT(Email);
CREATE INDEX idx_records_student ON RECORDS(Student_Id);
CREATE INDEX idx_records_book ON RECORDS(Book_Id);
CREATE INDEX idx_records_status ON RECORDS(Status);
