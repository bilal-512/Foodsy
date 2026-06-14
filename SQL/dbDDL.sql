CREATE DATABASE IF NOT EXISTS FooddeliveryDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE FooddeliveryDB;

-- =========================
-- PERSON
-- =========================
CREATE TABLE Person (
    PersonID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) NOT NULL DEFAULT '',
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'Customer',
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_person_email (Email)
) ENGINE=InnoDB;

-- =========================
-- CUSTOMER
-- =========================
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    PersonID INT NOT NULL,
    WalletBalance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    DefaultAddressID INT DEFAULT NULL,
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID) ON DELETE CASCADE,
    UNIQUE KEY uq_customer_person (PersonID)
) ENGINE=InnoDB;

-- =========================
-- ADMIN
-- =========================
CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    PersonID INT NOT NULL,
    Permissions VARCHAR(200) NOT NULL DEFAULT '',
    LastLogin DATETIME DEFAULT NULL,
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID) ON DELETE CASCADE,
    UNIQUE KEY uq_admin_person (PersonID)
) ENGINE=InnoDB;

-- =========================
-- EMPLOYEE
-- =========================
CREATE TABLE Employee (
    EmployeeID INT PRIMARY KEY AUTO_INCREMENT,
    PersonID INT NOT NULL,
    AdminID INT DEFAULT NULL,
    JobTitle VARCHAR(50) NOT NULL DEFAULT '',
    Department VARCHAR(50) NOT NULL DEFAULT '',
    HireDate DATE DEFAULT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE SET NULL,
    UNIQUE KEY uq_employee_person (PersonID)
) ENGINE=InnoDB;

-- =========================
-- AREA
-- =========================
CREATE TABLE Area (
    AreaID INT PRIMARY KEY AUTO_INCREMENT,
    AreaName VARCHAR(100) NOT NULL,
    LatCoordinate DECIMAL(10,6) DEFAULT NULL,
    LngCoordinate DECIMAL(10,6) DEFAULT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- RIDER
-- =========================
CREATE TABLE Rider (
    RiderID INT PRIMARY KEY AUTO_INCREMENT,
    PersonID INT NOT NULL,
    AssignedAreaID INT DEFAULT NULL,
    AdminID INT DEFAULT NULL,
    VehicleType VARCHAR(50) NOT NULL DEFAULT 'Bike',
    Licence VARCHAR(50) NOT NULL DEFAULT '',
    IsAvailable BOOLEAN NOT NULL DEFAULT TRUE,
    AvgRating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID) ON DELETE CASCADE,
    FOREIGN KEY (AssignedAreaID) REFERENCES Area(AreaID) ON DELETE SET NULL,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE SET NULL,
    UNIQUE KEY uq_rider_person (PersonID)
) ENGINE=InnoDB;

-- =========================
-- ADDRESS
-- =========================
CREATE TABLE Address (
    AddressID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT DEFAULT NULL,
    EmployeeID INT DEFAULT NULL,
    AreaID INT DEFAULT NULL,
    Label VARCHAR(50) NOT NULL DEFAULT 'Home',
    Street VARCHAR(100) NOT NULL DEFAULT '',
    City VARCHAR(50) NOT NULL DEFAULT '',
    Latitude DECIMAL(10,6) DEFAULT NULL,
    Longitude DECIMAL(10,6) DEFAULT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID) ON DELETE SET NULL,
    FOREIGN KEY (AreaID) REFERENCES Area(AreaID) ON DELETE SET NULL
) ENGINE=InnoDB;

ALTER TABLE Customer
    ADD CONSTRAINT fk_customer_default_address
    FOREIGN KEY (DefaultAddressID) REFERENCES Address(AddressID) ON DELETE SET NULL;

-- =========================
-- RESTAURANT
-- =========================
CREATE TABLE Restaurant (
    RestaurantID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Logo VARCHAR(200) NOT NULL DEFAULT '',
    OpenTime TIME NOT NULL DEFAULT '10:00:00',
    CloseTime TIME NOT NULL DEFAULT '23:00:00',
    BaseLocation VARCHAR(100) NOT NULL DEFAULT '',
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- CATEGORY
-- =========================
CREATE TABLE Category (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    RestaurantID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(200) NOT NULL DEFAULT '',
    DisplayOrder INT NOT NULL DEFAULT 1,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    ImgURL VARCHAR(255) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- MENU ITEM
-- =========================
CREATE TABLE MenuItem (
    MenuItemID INT PRIMARY KEY AUTO_INCREMENT,
    CategoryID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(200) NOT NULL DEFAULT '',
    IsAvailable BOOLEAN NOT NULL DEFAULT TRUE,
    BasePrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ImgURL VARCHAR(255) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- MENU ITEM VARIANT
-- =========================
CREATE TABLE MenuItemVariant (
    VariantID INT PRIMARY KEY AUTO_INCREMENT,
    MenuItemID INT NOT NULL,
    Label VARCHAR(50) NOT NULL,
    PriceDelta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem(MenuItemID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- CART
-- =========================
CREATE TABLE Cart (
    CartID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    UNIQUE KEY uq_cart_customer_active (CustomerID, Status)
) ENGINE=InnoDB;

-- =========================
-- CART ITEM
-- =========================
CREATE TABLE CartItem (
    CartItemID INT PRIMARY KEY AUTO_INCREMENT,
    CartID INT NOT NULL,
    MenuItemID INT NOT NULL,
    VariantID INT DEFAULT NULL,
    Quantity INT NOT NULL DEFAULT 1 CHECK (Quantity > 0),
    Price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (CartID) REFERENCES Cart(CartID) ON DELETE CASCADE,
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem(MenuItemID) ON DELETE RESTRICT,
    FOREIGN KEY (VariantID) REFERENCES MenuItemVariant(VariantID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- PROMO CODE
-- =========================
CREATE TABLE PromoCode (
    PromoCodeID INT PRIMARY KEY AUTO_INCREMENT,
    Code VARCHAR(50) NOT NULL,
    DiscountType ENUM('percent', 'flat') NOT NULL DEFAULT 'percent',
    DiscountValue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    MinOrderAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    MaxUses INT NOT NULL DEFAULT 100,
    UsedCount INT NOT NULL DEFAULT 0,
    ValidFrom DATE NOT NULL,
    ValidUntil DATE NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_promo_code (Code)
) ENGINE=InnoDB;

-- =========================
-- ORDERS
-- =========================
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    AdminID INT DEFAULT NULL,
    AddressID INT DEFAULT NULL,
    AssignedRiderID INT DEFAULT NULL,
    PromoCodeID INT DEFAULT NULL,
    OrderStatus ENUM(
        'pending', 'confirmed', 'preparing', 'assigned',
        'picked_up', 'delivered', 'cancelled'
    ) NOT NULL DEFAULT 'pending',
    PlacedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ConfirmedAt DATETIME DEFAULT NULL,
    ReadyAt DATETIME DEFAULT NULL,
    DeliveredAt DATETIME DEFAULT NULL,
    CancelledAt DATETIME DEFAULT NULL,
    CancelReason VARCHAR(200) DEFAULT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE RESTRICT,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE SET NULL,
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID) ON DELETE SET NULL,
    FOREIGN KEY (AssignedRiderID) REFERENCES Rider(RiderID) ON DELETE SET NULL,
    FOREIGN KEY (PromoCodeID) REFERENCES PromoCode(PromoCodeID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- ORDER ITEM
-- =========================
CREATE TABLE OrderItem (
    OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    MenuItemID INT NOT NULL,
    VariantID INT DEFAULT NULL,
    Quantity INT NOT NULL DEFAULT 1 CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem(MenuItemID) ON DELETE RESTRICT,
    FOREIGN KEY (VariantID) REFERENCES MenuItemVariant(VariantID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================
-- BILL
-- =========================
CREATE TABLE Bill (
    BillID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    SubTotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    TaxAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    TotalAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PaymentStatus ENUM('pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    GeneratedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    UNIQUE KEY uq_bill_order (OrderID)
) ENGINE=InnoDB;

-- =========================
-- PAYMENT
-- =========================
CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    BillID INT NOT NULL,
    Method ENUM('cash', 'card', 'online') NOT NULL DEFAULT 'cash',
    TransactionRef VARCHAR(100) DEFAULT NULL,
    GatewayResponse VARCHAR(200) DEFAULT NULL,
    PaidAt DATETIME DEFAULT NULL,
    FOREIGN KEY (BillID) REFERENCES Bill(BillID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- REVIEW
-- =========================
CREATE TABLE Review (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    CustomerID INT NOT NULL,
    RiderID INT DEFAULT NULL,
    FoodRating TINYINT NOT NULL CHECK (FoodRating BETWEEN 1 AND 5),
    RiderRating TINYINT DEFAULT NULL CHECK (RiderRating BETWEEN 1 AND 5),
    Comment VARCHAR(200) NOT NULL DEFAULT '',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (RiderID) REFERENCES Rider(RiderID) ON DELETE SET NULL,
    UNIQUE KEY uq_review_order (OrderID)
) ENGINE=InnoDB;

-- =========================
-- NOTIFICATION
-- =========================
CREATE TABLE Notification (
    NotificationID INT PRIMARY KEY AUTO_INCREMENT,
    PersonID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Message VARCHAR(200) NOT NULL DEFAULT '',
    Type VARCHAR(50) NOT NULL DEFAULT 'info',
    IsRead BOOLEAN NOT NULL DEFAULT FALSE,
    SentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- PERFORMANCE INDEXES
-- =========================
CREATE INDEX idx_orders_customer ON Orders(CustomerID);
CREATE INDEX idx_orders_status ON Orders(OrderStatus);
CREATE INDEX idx_orders_rider ON Orders(AssignedRiderID);
CREATE INDEX idx_orders_placed_at ON Orders(PlacedAt);
CREATE INDEX idx_cart_customer ON Cart(CustomerID);
CREATE INDEX idx_cart_item_cart ON CartItem(CartID);
CREATE INDEX idx_order_item_order ON OrderItem(OrderID);
CREATE INDEX idx_address_customer ON Address(CustomerID);
CREATE INDEX idx_notification_person ON Notification(PersonID);
CREATE INDEX idx_notification_unread ON Notification(PersonID, IsRead);
CREATE INDEX idx_menu_item_category ON MenuItem(CategoryID);
CREATE INDEX idx_category_restaurant ON Category(RestaurantID);
