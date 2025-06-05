# 📚 Online Bookstore API (NestJS + Prisma + PostgreSQL)

This is the backend service for the **Online Bookstore Web Application**, built with **NestJS**, **Prisma**, and **PostgreSQL**. It handles authentication and user management as the foundation for the full bookstore system.

---

## ✅ Features Implemented

### 🧱 Base Stack

- **NestJS**: Progressive Node.js framework for building scalable server-side applications
- **Prisma ORM**: Type-safe database client
- **PostgreSQL**: Relational database for storing user and book data
- **TypeScript**: Ensures strict type safety across backend code

---

## ✅ Modules Implemented

### 1. 🔐 `User` Module

- User registration and hashed password storage
- Secure login using JWT
- Role-based access support (`USER`, `ADMIN`)

### 2. 🔐 `Auth` Module

- JWT-based authentication
- Login endpoint (`POST /auth/login`)
- Token generation and validation

---

## 🗃️ Prisma Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

# Prisma related commands

npm install prisma @prisma/client
npx prisma init
npx prisma generate
npx prisma db push for current MVP

# For later production versioning

npx prisma migrate dev --name init
npx prisma migrate deploy

🔌 API Endpoints
Method Endpoint Description
POST /auth/login User login
(WIP) /auth/register User registration
(WIP) /books Book CRUD (next)

🛠 Setup Instructions

1. Clone the Repository
   git clone https://github.com/egsir1/online-bookstore-api.git
   cd online-bookstore-api

2. Install Dependencies
   npm install

3. Configure .env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/online_bookstore"
   JWT_SECRET="jwt_secret"

4. Prisma Setup
   npx prisma migrate dev --name init
   npx prisma generate

5. Start Development Server
   npm run start:dev
   🧪 Tech Stack
   Backend: NestJS + TypeScript

ORM: Prisma

Database: PostgreSQL

Authentication: JWT

Password Security: bcrypt

📌 TODO (Next Steps)
Add register endpoint (POST /auth/register)

Create Book module with full CRUD

Protect routes with JWT guards

Implement pagination, filtering, and sales tracking

🧑‍💻 Developer
Sirojiddin Egamberdiev
