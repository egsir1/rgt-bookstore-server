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
