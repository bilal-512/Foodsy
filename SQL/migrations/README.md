# Database Migrations

Run migrations in numeric order against a fresh MySQL instance.

```bash
for f in mysqldatabasef/migrations/*.sql; do
  mysql -u root -p < "$f"
done
```

Or use the combined script for a full reset:

```bash
mysql -u root -p < mysqldatabasef/dbDDL.sql
mysql -u root -p < mysqldatabasef/dbDML2.sql
```

| File | Description |
|------|-------------|
| `001_create_database.sql` | Create `FooddeliveryDB` |
| `002_person_roles.sql` | Person, Customer, Admin, Employee |
| `003_location.sql` | Area, Rider, Address + Customer default address FK |
| `004_catalog.sql` | Restaurant, Category, MenuItem, MenuItemVariant |
| `005_cart.sql` | Cart, CartItem |
| `006_orders.sql` | PromoCode, Orders, OrderItem, Bill, Payment |
| `007_engagement.sql` | Review, Notification |
| `008_indexes.sql` | Secondary indexes for query performance |
