🍔 Food Delivery Management System Database

📌 Project Description

The Food Delivery Management System is a comprehensive database solution designed to manage the operations of an online food ordering and delivery platform. The system supports customers, restaurants, administrators, riders, menu management, cart operations, order processing, billing, payments, delivery tracking, reviews, and notifications.

The database has been designed using Entity Relationship Modeling (ERD), Relational Schema Mapping, Functional Dependency Analysis, and Database Normalization techniques up to Third Normal Form (3NF) to ensure data integrity, consistency, scalability, and minimal redundancy.

---

🎯 Project Objectives

General Objective

To design and implement a normalized relational database for a modern food delivery platform that efficiently manages customer orders, restaurant menus, payments, deliveries, and user interactions.

Specific Objectives

- Manage customer and user information securely.
- Support restaurant and menu management.
- Enable customers to place and track food orders.
- Maintain shopping carts and order histories.
- Manage promotional discounts through promo codes.
- Generate bills and process payments.
- Assign riders for order deliveries.
- Collect customer reviews and ratings.
- Provide notification services for important events.
- Ensure data integrity through normalization and relational constraints.

---

🏗️ System Architecture

The database follows a modular architecture consisting of the following major components:

User Management

- Person
- Customer
- Admin
- Employee
- Rider

Location Management

- Area
- Address

Restaurant Management

- Restaurant
- Category
- MenuItem
- MenuItemVariant

Order Processing

- Cart
- CartItem
- Orders
- OrderItem

Payment Management

- PromoCode
- Bill
- Payment

Delivery Management

- Delivery

Feedback Management

- Review

Communication Management

- Notification

---

📊 Database Schema

Core Entities

Person

Stores common information for all system users.

Attribute
PersonID
Name
Email
Phone
Password
Role
IsActive

Customer

Stores customer-specific information.

Attribute
CustomerID
PersonID
WalletBalance
DefaultAddressID

Admin

Stores administrative user information.

Attribute
AdminID
PersonID
Permissions
LastLogin

Employee

Stores employee information.

Attribute
EmployeeID
PersonID
AdminID
JobTitle
Department
HireDate
IsActive

Rider

Stores rider information responsible for deliveries.

Attribute
RiderID
PersonID
AssignedAreaID
AdminID
VehicleType
Licence
IsAvailable
AvgRating

---

Restaurant Module

Restaurant

Attribute
RestaurantID
Name
Logo
OpenTime
CloseTime
BaseLocation

Category

Attribute
CategoryID
RestaurantID
Name
Description
DisplayOrder
IsActive
ImgURL

MenuItem

Attribute
MenuItemID
CategoryID
Name
Description
IsAvailable
BasePrice

MenuItemVariant

Attribute
VariantID
MenuItemID
Label
PriceDelta

---

Cart Module

Cart

Attribute
CartID
CustomerID
Status
CreatedAt
UpdatedAt

CartItem

Attribute
CartItemID
CartID
MenuItemID
VariantID
Quantity
Price

---

Order Module

Orders

Attribute
OrderID
CustomerID
AdminID
AddressID
PromoCodeID
OrderStatus
PlacedAt
ConfirmedAt
ReadyAt
DeliveredAt
CancelledAt
CancelReason

OrderItem

Attribute
OrderItemID
OrderID
MenuItemID
VariantID
Quantity
UnitPrice

---

Payment Module

PromoCode

Attribute
PromoCodeID
Code
DiscountType
DiscountValue
MinOrderAmount
MaxUses
UsedCount
ValidFrom
ValidUntil
IsActive

Bill

Attribute
BillID
OrderID
SubTotal
TaxAmount
DiscountAmount
TotalAmount
PaymentStatus
GeneratedAt

Payment

Attribute
PaymentID
BillID
Method
TransactionRef
GatewayResponse
PaidAt

---

Delivery Module

Delivery

Attribute
DeliveryID
OrderID
RiderID
DistanceKM
AssignedAt
PickupTime
DeliveredTime
Status

---

Review Module

Review

Attribute
ReviewID
OrderID
CustomerID
RiderID
FoodRating
RiderRating
Comment
CreatedAt

---

Notification Module

Notification

Attribute
NotificationID
PersonID
Title
Message
Type
IsRead
SentAt

---

🔗 Key Relationships

- A Person can act as a Customer, Admin, Employee, or Rider.
- A Customer can have multiple Addresses.
- An Address belongs to an Area.
- A Restaurant contains multiple Categories.
- A Category contains multiple Menu Items.
- A Menu Item may have multiple Variants.
- A Customer owns a Cart.
- Cart and MenuItem have a many-to-many relationship through CartItem.
- A Customer places Orders.
- Orders and MenuItems have a many-to-many relationship through OrderItem.
- Orders may use Promo Codes.
- Each Order generates one Bill.
- Each Bill may have one Payment.
- Riders deliver Orders.
- Customers can review completed orders and riders.
- Notifications are sent to users through Person records.

---

🧩 Functional Dependencies

Examples:

PersonID → Name, Email, Phone, Password, Role, IsActive

CustomerID → PersonID, WalletBalance

RestaurantID → Name, Logo, OpenTime, CloseTime, BaseLocation

OrderID → CustomerID, AddressID, PromoCodeID,
          OrderStatus, PlacedAt, DeliveredAt

BillID → OrderID, SubTotal, TaxAmount,
         DiscountAmount, TotalAmount

---

📐 Normalization

The database has been normalized up to Third Normal Form (3NF).

First Normal Form (1NF)

- Atomic values only
- No repeating groups
- Unique primary keys

Second Normal Form (2NF)

- No partial dependencies
- Composite-key relations analyzed
- Surrogate keys used where appropriate

Third Normal Form (3NF)

- No transitive dependencies
- Entity separation through foreign keys
- Redundancy minimized

Accepted Denormalization

For performance optimization:

- "Bill.TotalAmount"
- "Rider.AvgRating"

These values are maintained through application logic.

---

🛠 Technologies Used

- MySQL Database
- SQL
- ERD Modeling
- Relational Database Design
- Functional Dependency Analysis
- Database Normalization

---

🚀 Future Improvements

- Real-time order tracking
- Mobile application integration
- Online payment gateway integration
- AI-powered food recommendations
- Restaurant analytics dashboard
- Dynamic rider allocation
- Customer loyalty system

---

👥 Team Members

Name| Roll Number
Hassnain Ali| NUM-BSCS-2024-26
M bilal| NUM-BSCS-2024-47
M waseem| NUM-BSCS-2024-78

---

👨‍🏫 Instructor
Asiya Batool

---

🎓 Institution

Department of Computer Science
Namal University, Mianwali, Pakistan

---

📄 License

This project was developed for educational and academic purposes as part of the Database Systems course at Namal University.

---

⭐ Project Status

✅ Database Design Completed
✅ Relational Schema Completed
✅ Functional Dependency Analysis Completed
✅ Normalization Completed (3NF)
✅ Documentation Completed
