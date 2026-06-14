USE FooddeliveryDB;

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
