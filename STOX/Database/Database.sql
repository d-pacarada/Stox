CREATE DATABASE IF NOT EXISTS stoxDB;
USE stoxDB;

CREATE TABLE User (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Business_Name VARCHAR(100),
    Business_Number VARCHAR(50),
    Email VARCHAR(100),
    Phone_Number VARCHAR(20),
    Address TEXT,
    Transit_Number VARCHAR(50),
    Password VARCHAR(100),
    DATE DATETIME DEFAULT CURRENT_TIMESTAMP,
    Role ENUM('admin', 'user') DEFAULT 'user'
);

-- PRODUCT 
CREATE TABLE Product (
    Product_ID INT PRIMARY KEY AUTO_INCREMENT,
    Product_Name VARCHAR(100),
    Description TEXT,
    Category VARCHAR(50),
    Stock_Quantity INT,
    Price DECIMAL(10,2)
);

-- CUSTOMER 
CREATE TABLE Customer (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT,
    Full_Name VARCHAR(100),
    Email VARCHAR(100),
    Phone_Number VARCHAR(20),
    Address TEXT
);

-- SALES 
CREATE TABLE Sales (
    Sales_ID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_ID INT,
    Product_ID INT,
    Quantity INT,
    Total_Price DECIMAL(10,2),
    Sale_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID),
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID)
);

-- CONTACT
CREATE TABLE Contact (
    Contact_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(100),
    Message TEXT,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP
);
