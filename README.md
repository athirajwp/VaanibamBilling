# BizFlow — Billing & Business Management System

A full-stack modern billing and inventory management application designed for wholesale, retail, and manufacturing businesses.

---

## 🏗️ Repository Architecture

```
BizFlow/
├── frontend/             # React 19 + TypeScript + Vite + TailwindCSS 4
│   ├── src/              # Pages, Components, Stores, and REST API Client
│   ├── package.json      # Frontend dependencies & scripts
│   └── vite.config.ts    # Vite bundler configuration
│
├── backend/              # Java 21 + Spring Boot 3.3.4 + SQLite 3
│   ├── src/              # Controllers, Services, Models, Repositories, DTOs
│   ├── pom.xml           # Maven build configuration
│   ├── bizflow.db        # SQLite database (auto-seeded)
│   ├── run-backend.bat   # Windows one-click backend launcher
│   └── README.md         # Full REST API documentation & Swagger details
│
├── package.json          # Root monorepo scripts
└── README.md             # Project documentation
```

---

## ⚡ Quick Start

### 1. Start Frontend
```bash
cd frontend
npm run dev
```
Or from root:
```bash
npm run frontend:dev
```
Frontend runs at: `http://localhost:5173`

---

### 2. Start Backend
```bash
cd backend
run-backend.bat
```
Or via Maven / root npm:
```bash
npm run backend:dev
```
Backend runs at: `http://localhost:8080/api`
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 🧪 Testing & Building

### Frontend
```bash
cd frontend
npm run build
npm run lint
```

### Backend
```bash
cd backend
mvn test
mvn clean package -DskipTests
```
