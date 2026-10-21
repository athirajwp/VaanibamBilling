# BizFlow Backend (Java Spring Boot + SQLite)

Production-grade RESTful API backend for **BizFlow** — Billing, Inventory, GST, and Business Management system, built with **Java 21**, **Spring Boot 3.3.4**, and **SQLite 3**.

---

## 🚀 Technology Stack

- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.3.4
- **Database**: SQLite 3 (stored as `bizflow.db`)
- **Persistence / ORM**: Spring Data JPA & Hibernate 6 (`hibernate-community-dialects`)
- **Connection Pool**: HikariCP with `sqlite-jdbc`
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **API Documentation**: OpenAPI 3.0 / Swagger UI (`springdoc-openapi-starter-webmvc-ui:2.6.0`)
- **Build Tool**: Apache Maven (with `mvnw` / `mvnw.cmd` wrapper)

---

## 📂 Project Structure

```
backend/
├── pom.xml                                      # Maven configuration & dependencies
├── mvnw / mvnw.cmd                              # Maven wrapper scripts
├── run-backend.bat / run-backend.ps1            # Easy Windows startup scripts
├── bizflow.db                                   # SQLite database file
├── src/
│   ├── main/
│   │   ├── java/com/bizflow/
│   │   │   ├── BizflowBackendApplication.java   # Spring Boot entry point
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java              # CORS for React/Vite dev server
│   │   │   │   └── OpenApiConfig.java           # Swagger / OpenAPI documentation
│   │   │   ├── controller/                      # REST API Controllers (10 controllers)
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── CustomerController.java
│   │   │   │   ├── SupplierController.java
│   │   │   │   ├── InvoiceController.java
│   │   │   │   ├── QuotationController.java
│   │   │   │   ├── PurchaseController.java
│   │   │   │   ├── ExpenseController.java
│   │   │   │   ├── ReportController.java
│   │   │   │   ├── DashboardController.java
│   │   │   │   └── SettingsController.java
│   │   │   ├── dto/                             # Request/Response Data Transfer Objects
│   │   │   ├── exception/                       # Custom exceptions & global handler
│   │   │   ├── init/
│   │   │   │   └── DataInitializer.java        # Auto-seeds default datasets into SQLite
│   │   │   ├── model/                           # JPA Entities (Products, Invoices, etc.)
│   │   │   ├── repository/                      # Spring Data JPA Repositories
│   │   │   └── service/                         # Business logic & transaction management
│   │   └── resources/
│   │       └── application.properties           # SQLite, Hibernate & server configuration
│   └── test/
│       └── java/com/bizflow/                    # Context & DataInitializer integration tests
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Java 21 JDK (installed and available on your PATH)
- Maven 3.9+ (or use included `./mvnw`)

### 2. Run the Backend
Using batch or powershell script on Windows:
```cmd
cd backend
run-backend.bat
```
Or with Maven directly:
```bash
cd backend
mvn spring-boot:run
```
Or using the Maven Wrapper:
```cmd
mvnw.cmd spring-boot:run
```

The application will start on port **8080**:
- **Base URL**: `http://localhost:8080/api`
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

### 3. Run Tests
```bash
mvn test
```

### 4. Build Production JAR
```bash
mvn clean package -DskipTests
java -jar target/bizflow-backend-1.0.0.jar
```

---

## 🗄️ Database (SQLite)

- **Database File**: `backend/bizflow.db`
- **Initial Data Seeding**:
  When starting for the first time, `DataInitializer` automatically populates the SQLite database with:
  - **Business Profile**: Sri Lakshmi Crackers (GSTIN, Phone, Address, Sivakasi)
  - **Products**: 15 items with category, SKU, Barcode, GST rate, HSN, stock, bulk pricing tiers
  - **Categories**: Sparklers, Flower Pots, Rockets, Chakkars, Fancy Shots, Gift Boxes, Lakshmi, Bombs, Ground Spinners
  - **Godowns**: Main Godown, Sivakasi West Godown, Factory Depot
  - **Customers**: 10 customer records with GSTIN, phone, address, credit limit, and opening balance
  - **Suppliers**: 5 manufacturer suppliers with GSTIN and balances
  - **Invoices, Purchases & Quotations**: Sample documents with full line items, GST breakdown, and payment records
  - **Expenses**: Categories including Rent, Salary, Electricity, Transport, Marketing, Maintenance
  - **Settings**: Invoice template preferences, 7 standard GST tax slabs, users, printers, and online store configuration

---

## 📡 REST API Reference

### 📦 Products & Inventory
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all products (supports `?q=` search and `?category=`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `GET` | `/api/products/low-stock` | Get products at or below minimum stock level |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/{id}` | Update product details |
| `DELETE` | `/api/products/{id}` | Delete product |
| `POST` | `/api/products/{id}/duplicate`| Duplicate product with `-COPY` SKU |
| `POST` | `/api/products/adjust-stock` | Adjust stock quantity (`in` or `out`) with reason audit |
| `GET` | `/api/products/adjustments` | Audit history of stock adjustments |
| `POST` | `/api/products/import` | Bulk import product list |
| `GET` | `/api/products/categories` | List product categories |
| `POST` | `/api/products/categories` | Add product category |
| `DELETE`| `/api/products/categories/{id}` | Delete product category |
| `GET` | `/api/products/godowns` | List warehouse godowns |
| `POST` | `/api/products/godowns` | Add warehouse godown |
| `DELETE`| `/api/products/godowns/{id}` | Delete warehouse godown |

---

### 🧾 Billing & Sales Invoices
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/invoices` | List all sales invoices (ordered newest first) |
| `GET` | `/api/invoices/{id}` | Get invoice details with line items |
| `GET` | `/api/invoices/customer/{customerId}` | List invoices for a specific customer |
| `POST` | `/api/invoices` | Create invoice, auto-generate invoice number, deduct stock |
| `PUT` | `/api/invoices/{id}` | Update invoice |
| `POST` | `/api/invoices/{id}/pay` | Record payment against invoice (`amount`, `method`) |
| `POST` | `/api/invoices/{id}/cancel` | Cancel invoice and restore product inventory |
| `POST` | `/api/invoices/{id}/duplicate` | Duplicate invoice as draft |
| `GET` | `/api/invoices/returns` | List sales returns |
| `POST` | `/api/invoices/returns` | Process sales return, restore stock, adjust invoice balance |

---

### 📝 Quotations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quotations` | List all quotations |
| `GET` | `/api/quotations/{id}` | Get quotation details |
| `POST` | `/api/quotations` | Create new quotation (`QT-101`) |
| `PATCH`| `/api/quotations/{id}/status` | Update status (`draft`, `sent`, `accepted`, `rejected`, `expired`) |
| `POST` | `/api/quotations/{id}/convert` | Convert quotation to finalized invoice and decrement stock |
| `DELETE`| `/api/quotations/{id}` | Delete quotation |

---

### 📥 Purchases (Inward Bills)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/purchases` | List all purchase bills |
| `GET` | `/api/purchases/{id}` | Get purchase bill details |
| `GET` | `/api/purchases/supplier/{supplierId}` | List purchase bills by supplier |
| `POST` | `/api/purchases` | Create purchase bill, increment product stock |
| `PUT` | `/api/purchases/{id}` | Update purchase bill |
| `POST` | `/api/purchases/{id}/pay` | Record payment towards purchase bill |
| `POST` | `/api/purchases/{id}/cancel` | Cancel purchase and remove added inventory |
| `GET` | `/api/purchases/returns` | List purchase returns |
| `POST` | `/api/purchases/returns` | Create purchase return to supplier and reduce stock |

---

### 👥 Customers & Suppliers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List or search customers (`?q=`) |
| `GET` | `/api/customers/{id}` | Get customer profile |
| `GET` | `/api/customers/{id}/ledger`| Get customer ledger, total sales, amount paid, and outstanding |
| `POST` | `/api/customers` | Create customer |
| `PUT` | `/api/customers/{id}` | Update customer |
| `DELETE`| `/api/customers/{id}` | Delete customer |
| `GET` | `/api/suppliers` | List or search suppliers (`?q=`) |
| `GET` | `/api/suppliers/{id}` | Get supplier profile |
| `GET` | `/api/suppliers/{id}/ledger`| Get supplier ledger, total purchases, and outstanding payable |
| `POST` | `/api/suppliers` | Create supplier |
| `PUT` | `/api/suppliers/{id}` | Update supplier |
| `DELETE`| `/api/suppliers/{id}` | Delete supplier |

---

### 💸 Expenses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | List expenses (optional `?from=` and `?to=`) |
| `GET` | `/api/expenses/{id}` | Get expense by ID |
| `GET` | `/api/expenses/breakdown` | Category-wise expense breakdown |
| `POST` | `/api/expenses` | Record a new expense |
| `PUT` | `/api/expenses/{id}` | Update expense |
| `DELETE`| `/api/expenses/{id}` | Delete expense |

---

### 📊 Reports & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/sales-summary` | Summary of sales, purchases, gross profit, orders, and outstanding |
| `GET` | `/api/reports/daily-series` | Time-series data for daily sales, purchases, and profit charts |
| `GET` | `/api/reports/top-products` | Top selling products by revenue and units (`?limit=6`) |
| `GET` | `/api/reports/gst-summary` | Complete outward vs inward GST report with net tax payable |
| `GET` | `/api/reports/customers` | Customer-wise sales, paid, and outstanding receivables |
| `GET` | `/api/dashboard/stats` | High-level summary metrics for main dashboard cards |

---

### ⚙️ Settings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Get all application settings aggregated |
| `GET` | `/api/settings/business` | Get business profile info |
| `PUT` | `/api/settings/business` | Update business name, logo, GSTIN, phone, address, prefix |
| `PUT` | `/api/settings/invoice` | Update invoice layout, template, and print preferences |
| `PUT` | `/api/settings/taxes` | Save GST tax rates list |
| `PUT` | `/api/settings/users` | Save user and staff accounts with permissions |
| `PUT` | `/api/settings/printers` | Save printer devices configuration |
| `PUT` | `/api/settings/online-store`| Update online catalogue store info and published products |

---

## 🔗 Frontend Integration

The backend is pre-configured with CORS for `*` and `http://localhost:5173`.
A client layer is available in `src/services/apiClient.ts` and `src/services/backendService.ts`.

To configure a custom backend URL in the frontend, add to `.env`:
```env
VITE_API_URL=http://localhost:8080/api
```
