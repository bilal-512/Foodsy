USE FooddeliveryDB;

SET FOREIGN_KEY_CHECKS = 0;

-- bcrypt hash for password "123"
SET @pwd = '$2a$10$6/MD3SmYUgerrkUVqsVJFe.nYMYO5VUiwYiJgrd8s/NSbGRPSrC1i';
-- bcrypt hash for password "admin@123"
SET @admin_pwd = '$2a$10$l0C3mstE3uNollDyVtAsSu.vxMG.ZN9kzDh229QGfbvtqKktvmgsO';

-- =====================================================
-- 1. PERSON
-- =====================================================
INSERT INTO Person (PersonID, Name, Email, Phone, Password, Role, IsActive) VALUES
(1,'Ali','ali@gmail.com','0301',@pwd,'Customer',1),
(2,'Ahmed','ahmed@gmail.com','0302',@pwd,'Customer',1),
(3,'Sara','sara@gmail.com','0303',@pwd,'Customer',1),
(4,'Usman','usman@gmail.com','0304',@pwd,'Customer',1),
(5,'Hina','hina@gmail.com','0305',@pwd,'Customer',1),
(6,'Zain','zain@gmail.com','0306',@pwd,'Admin',1),
(7,'Kashif','kashif@gmail.com','0307',@pwd,'Admin',1),
(8,'Iqra','iqra@gmail.com','0308',@pwd,'Customer',1),
(9,'Ayesha','ayesha@gmail.com','0309',@pwd,'Customer',1),
(10,'Bilal','bilal@gmail.com','0310',@pwd,'Rider',1),
(11,'Hamza','hamza@gmail.com','0311',@pwd,'Rider',1),
(12,'Saad','saad@gmail.com','0312',@pwd,'Employee',1),
(13,'Farhan','farhan@gmail.com','0313',@pwd,'Employee',1),
(14,'Noor','noor@gmail.com','0314',@pwd,'Customer',1),
(21,'Admin','admin@email.com','',@admin_pwd,'Admin',1);

-- =====================================================
-- 2. AREA
-- =====================================================
INSERT INTO Area (AreaID, AreaName, LatCoordinate, LngCoordinate) VALUES
(1,'Lahore',31.5,74.3),(2,'Karachi',24.8,67.0),(3,'Islamabad',33.6,73.0),
(4,'Peshawar',34.0,71.5),(5,'Quetta',30.1,66.9),(6,'Multan',30.1,71.5),
(7,'Faisalabad',31.4,73.1),(8,'Sialkot',32.4,74.5),(9,'Gujranwala',32.1,74.1),
(10,'Hyderabad',25.3,68.3),(11,'Sargodha',32.0,72.6),(12,'Bahawalpur',29.3,71.6),
(13,'Abbottabad',34.1,73.2),(14,'Swat',35.2,72.4);

-- =====================================================
-- 3. CUSTOMER (default address set after Address inserts)
-- =====================================================
INSERT INTO Customer (CustomerID, PersonID, WalletBalance, DefaultAddressID) VALUES
(1,1,500.00,NULL),(2,2,300.00,NULL),(3,3,700.00,NULL),(4,4,200.00,NULL),
(5,5,450.00,NULL),(6,8,600.00,NULL),(7,9,250.00,NULL),(8,14,800.00,NULL);

-- =====================================================
-- 4. ADMIN
-- =====================================================
INSERT INTO Admin (AdminID, PersonID, Permissions, LastLogin) VALUES
(1,6,'ALL','2026-06-01 10:00:00'),
(2,7,'ORDERS','2026-06-02 10:00:00'),
(3,21,'ALL',NULL);

-- =====================================================
-- 5. EMPLOYEE
-- =====================================================
INSERT INTO Employee (EmployeeID, PersonID, AdminID, JobTitle, Department, HireDate, IsActive) VALUES
(1,12,1,'Manager','HR','2025-01-01',1),
(2,13,2,'Supervisor','Operations','2025-02-01',1);

-- =====================================================
-- 6. RIDER
-- =====================================================
INSERT INTO Rider (RiderID, PersonID, AssignedAreaID, AdminID, VehicleType, Licence, IsAvailable, AvgRating) VALUES
(1,10,1,1,'Bike','L123',1,4.50),
(2,11,2,2,'Bike','L124',1,4.20);

-- =====================================================
-- 7. ADDRESS
-- =====================================================
INSERT INTO Address (AddressID, CustomerID, EmployeeID, AreaID, Label, Street, City, Latitude, Longitude) VALUES
(1,1,NULL,1,'Home','Street 1','Lahore',31.5,74.3),
(2,2,NULL,2,'Office','Street 2','Karachi',24.8,67.0),
(3,3,NULL,3,'Home','Street 3','Islamabad',33.6,73.0),
(4,4,NULL,4,'Home','Street 4','Peshawar',34.0,71.5),
(5,5,NULL,5,'Home','Street 5','Quetta',30.1,66.9),
(6,6,NULL,6,'Home','Street 6','Multan',30.1,71.5),
(7,7,NULL,7,'Home','Street 7','Faisalabad',31.4,73.1),
(8,8,NULL,8,'Home','Street 8','Sialkot',32.4,74.5);

UPDATE Customer SET DefaultAddressID = CustomerID;

-- =====================================================
-- 8. RESTAURANT
-- =====================================================
INSERT INTO Restaurant (RestaurantID, Name, Logo, OpenTime, CloseTime, BaseLocation) VALUES
(1,'KFC','logo.png','10:00:00','23:00:00','Lahore'),
(2,'McDonalds','logo.png','10:00:00','23:00:00','Karachi'),
(3,'Pizza Hut','logo.png','10:00:00','23:00:00','Islamabad'),
(4,'Dominos','logo.png','10:00:00','23:00:00','Multan'),
(5,'Burger Lab','logo.png','10:00:00','23:00:00','Faisalabad');

-- =====================================================
-- 9. CATEGORY
-- =====================================================
INSERT INTO Category (CategoryID, RestaurantID, Name, Description, DisplayOrder, IsActive, ImgURL) VALUES
(1,1,'Burger','Fast Food',1,1,'img'),
(2,2,'Burger','Fast Food',1,1,'img'),
(3,3,'Pizza','Italian',1,1,'img'),
(4,4,'Pizza','Italian',1,1,'img'),
(5,5,'Burger','Fast Food',1,1,'img'),
(6,1,'Wrap','Fast Food',2,1,'img'),
(7,2,'Sandwich','Fast Food',2,1,'img'),
(8,3,'BBQ','Grill',2,1,'img'),
(9,4,'Chicken','Spicy',2,1,'img'),
(10,5,'Dessert','Sweet',2,1,'img'),
(11,1,'Street Food','Desi',3,1,'img'),
(12,2,'Snacks','Fast',3,1,'img'),
(13,3,'Rice','Arabian',3,1,'img'),
(14,4,'Drink','Beverages',3,1,'img');

-- =====================================================
-- 10. MENU ITEM
-- =====================================================
INSERT INTO MenuItem (MenuItemID, CategoryID, Name, Description, IsAvailable, BasePrice) VALUES
(1,1,'Zinger Burger','Crispy chicken burger',1,250.00),
(2,2,'Beef Burger','Classic beef patty',1,300.00),
(3,3,'Pizza','Cheese loaded pizza',1,800.00),
(4,4,'Cheese Pizza','Four cheese blend',1,750.00),
(5,5,'Chicken Burger','Grilled chicken',1,280.00),
(6,6,'Wrap','Chicken wrap',1,180.00),
(7,7,'Sandwich','Club sandwich',1,220.00),
(8,8,'BBQ Wings','Smoky wings',1,500.00),
(9,9,'Chicken','Spicy fried chicken',1,600.00),
(10,10,'Ice Cream','Vanilla scoop',1,120.00),
(11,11,'Gol Gappay','Street snack',1,100.00),
(12,12,'Fries','Crispy fries',1,150.00),
(13,13,'Rice','Arabian rice platter',1,500.00),
(14,14,'Mango Shake','Fresh mango drink',1,180.00);

-- =====================================================
-- 11. MENU ITEM VARIANT
-- =====================================================
INSERT INTO MenuItemVariant (VariantID, MenuItemID, Label, PriceDelta) VALUES
(1,1,'Large',50.00),(2,2,'Small',0.00),(3,3,'Extra Cheese',100.00),
(4,4,'Large',120.00),(5,5,'Spicy',20.00),(6,6,'Large',30.00),
(7,7,'Grilled',20.00),(8,8,'Hot',50.00),(9,9,'Family',200.00),
(10,10,'Double Scoop',40.00),(11,11,'Full',50.00),(12,12,'Large',30.00);

-- =====================================================
-- 12. CART
-- =====================================================
INSERT INTO Cart (CartID, CustomerID, Status) VALUES
(1,1,'active'),(2,2,'active'),(3,3,'active'),(4,4,'active'),
(5,5,'active'),(6,6,'active'),(7,7,'active'),(8,8,'active');

-- =====================================================
-- 13. PROMO CODE
-- =====================================================
INSERT INTO PromoCode (PromoCodeID, Code, DiscountType, DiscountValue, MinOrderAmount, MaxUses, UsedCount, ValidFrom, ValidUntil, IsActive) VALUES
(1,'SAVE10','percent',10.00,200.00,100,0,'2026-01-01','2026-12-31',1),
(2,'SAVE20','percent',20.00,300.00,100,0,'2026-01-01','2026-12-31',1),
(3,'FLAT50','flat',50.00,500.00,100,0,'2026-01-01','2026-12-31',1),
(4,'NEWUSER','percent',15.00,100.00,100,0,'2026-01-01','2026-12-31',1),
(5,'FOODIE','percent',25.00,400.00,100,0,'2026-01-01','2026-12-31',1);

-- =====================================================
-- 14. ORDERS (lowercase statuses aligned with API)
-- =====================================================
INSERT INTO Orders (OrderID, CustomerID, AdminID, AddressID, AssignedRiderID, PromoCodeID, OrderStatus, PlacedAt, ConfirmedAt, ReadyAt, DeliveredAt, CancelledAt, CancelReason) VALUES
(1,1,1,1,1,1,'delivered','2026-06-01 10:00:00','2026-06-01 10:10:00','2026-06-01 10:20:00','2026-06-01 10:40:00',NULL,NULL),
(2,2,1,2,2,2,'delivered','2026-06-02 11:00:00','2026-06-02 11:10:00','2026-06-02 11:20:00','2026-06-02 11:40:00',NULL,NULL),
(3,3,2,3,NULL,3,'preparing','2026-06-03 12:00:00','2026-06-03 12:10:00',NULL,NULL,NULL,NULL),
(4,4,2,4,NULL,4,'cancelled','2026-06-04 13:00:00',NULL,NULL,NULL,'2026-06-04 13:30:00','Out of stock'),
(5,5,1,5,1,1,'delivered','2026-06-05 14:00:00','2026-06-05 14:10:00','2026-06-05 14:20:00','2026-06-05 14:40:00',NULL,NULL),
(6,6,1,6,2,2,'delivered','2026-06-06 10:00:00','2026-06-06 10:10:00','2026-06-06 10:20:00','2026-06-06 10:40:00',NULL,NULL),
(7,7,2,7,NULL,3,'preparing','2026-06-07 11:00:00','2026-06-07 11:10:00',NULL,NULL,NULL,NULL),
(8,8,2,8,1,4,'delivered','2026-06-08 12:00:00','2026-06-08 12:10:00','2026-06-08 12:20:00','2026-06-08 12:40:00',NULL,NULL);

-- =====================================================
-- 15. ORDER ITEM
-- =====================================================
INSERT INTO OrderItem (OrderItemID, OrderID, MenuItemID, VariantID, Quantity, UnitPrice) VALUES
(1,1,1,1,2,250.00),(2,2,2,2,1,300.00),(3,3,3,3,1,800.00),
(4,4,4,4,1,750.00),(5,5,5,5,1,280.00),(6,6,6,6,1,180.00),
(7,7,7,7,1,220.00),(8,8,8,8,1,500.00);

-- =====================================================
-- 16. BILL
-- =====================================================
INSERT INTO Bill (BillID, OrderID, SubTotal, TaxAmount, DiscountAmount, TotalAmount, PaymentStatus, GeneratedAt) VALUES
(1,1,500.00,50.00,0.00,550.00,'paid','2026-06-01 10:50:00'),
(2,2,300.00,30.00,0.00,330.00,'paid','2026-06-02 11:50:00'),
(3,3,800.00,80.00,0.00,880.00,'pending','2026-06-03 12:50:00'),
(4,4,750.00,75.00,0.00,825.00,'cancelled','2026-06-04 13:50:00'),
(5,5,280.00,28.00,0.00,308.00,'paid','2026-06-05 14:50:00'),
(6,6,180.00,18.00,0.00,198.00,'paid','2026-06-06 10:50:00'),
(7,7,220.00,22.00,0.00,242.00,'pending','2026-06-07 11:50:00'),
(8,8,500.00,50.00,0.00,550.00,'paid','2026-06-08 12:50:00');

-- =====================================================
-- 17. PAYMENT
-- =====================================================
INSERT INTO Payment (PaymentID, BillID, Method, TransactionRef, GatewayResponse, PaidAt) VALUES
(1,1,'card','TXN1','Success','2026-06-01 10:55:00'),
(2,2,'cash','TXN2','Success','2026-06-02 11:55:00'),
(3,3,'card','TXN3','Pending',NULL),
(4,4,'card','TXN4','Failed',NULL),
(5,5,'cash','TXN5','Success','2026-06-05 14:55:00'),
(6,6,'card','TXN6','Success','2026-06-06 10:55:00'),
(7,7,'cash','TXN7','Pending',NULL),
(8,8,'card','TXN8','Success','2026-06-08 12:55:00');

-- =====================================================
-- 18. REVIEW
-- =====================================================
INSERT INTO Review (ReviewID, OrderID, CustomerID, RiderID, FoodRating, RiderRating, Comment, CreatedAt) VALUES
(1,1,1,1,5,5,'Great','2026-06-01 11:00:00'),
(2,2,2,2,4,4,'Good','2026-06-02 12:00:00'),
(3,5,5,1,4,4,'Good','2026-06-05 15:00:00'),
(4,6,6,2,5,5,'Perfect','2026-06-06 11:00:00'),
(5,8,8,1,5,5,'Excellent','2026-06-08 13:00:00');

-- =====================================================
-- 19. NOTIFICATION
-- =====================================================
INSERT INTO Notification (NotificationID, PersonID, Title, Message, Type, IsRead, SentAt) VALUES
(1,1,'Order Delivered','Your order is delivered','order',1,'2026-06-01 12:00:00'),
(2,2,'Order Delivered','Your order is delivered','order',1,'2026-06-02 12:00:00'),
(3,3,'Order Preparing','Your order is being prepared','order',0,'2026-06-03 12:00:00'),
(4,4,'Order Cancelled','Order cancelled','order',1,'2026-06-04 12:00:00'),
(5,5,'Promo','Promo used','promo',1,'2026-06-05 12:00:00'),
(6,6,'Order Delivered','Delivered','order',1,'2026-06-06 12:00:00'),
(7,7,'Order Preparing','Preparing','order',0,'2026-06-07 12:00:00'),
(8,8,'Order Delivered','Delivered','order',1,'2026-06-08 12:00:00');

SET FOREIGN_KEY_CHECKS = 1;
