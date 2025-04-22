CREATE DATABASE IF NOT EXISTS stoxDB;
USE stoxDB;

-- USER TABLE
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

-- PRODUCT TABLE
CREATE TABLE Product (
    Product_ID INT PRIMARY KEY AUTO_INCREMENT,
    Product_Name VARCHAR(100),
    Description TEXT,
    Category VARCHAR(50),
    Stock_Quantity INT,
    Price DECIMAL(10,2)
);

-- CUSTOMER TABLE
CREATE TABLE Customer (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT,
    Full_Name VARCHAR(100),
    Email VARCHAR(100),
    Phone_Number VARCHAR(20),
    Address TEXT
);

-- INVOICE TABLE 
CREATE TABLE Invoice (
    Invoice_ID INT PRIMARY KEY AUTO_INCREMENT, 
    Customer_ID INT,                           
    Invoice_Date DATETIME DEFAULT CURRENT_TIMESTAMP, 
    Total_Amount DECIMAL(10,2),                 
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
);

-- INVOICE ITEMS TABLE 
CREATE TABLE Invoice_Items (
    Invoice_Item_ID INT PRIMARY KEY AUTO_INCREMENT,  
    Invoice_ID INT,                                  
    Product_ID INT,                                 
    Quantity INT,                                    
    Price DECIMAL(10,2),                             
    FOREIGN KEY (Invoice_ID) REFERENCES Invoice(Invoice_ID),
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID)
);

-- CONTACT TABLE
CREATE TABLE Contact (
    Contact_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(100),
    Message TEXT,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP
);
