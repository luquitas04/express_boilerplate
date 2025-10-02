# 🚀 Express + TypeORM + JWT Boilerplate

Boilerplate project for **Express (Node.js)** using **JavaScript**, with **Postgres + TypeORM**, **JWT authentication**, and a default **User entity**.  

---

## ⚙️ Initialization

```bash
# Create a new project from the generator script
node setup-express-js-typeorm.mjs my-express-api

cd my-express-api
npm install
```

---

## ✅ What's included
- ⚡ **Express (JS)** with helmet, cors, morgan.  
- 🗄️ **Postgres + TypeORM** configured with `.env`.  
- 👤 **User entity** with role (`admin` | `user`).  
- 🔑 **Authentication** (JWT login, register, profile `/me`).  
- 🛠 **CRUD routes** for users (protected, admin-only for mutations).  
- 🌱 **Seed script** to create a default admin.  
- 📦 **Nodemon** for development.  
- 📑 Ready for **migrations**.  

---

## ⚙️ Usage

```bash
# Run dev mode
npm run dev

# Seed default admin (admin@local.test / admin123)
npm run seed
```

Test login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.test","password":"admin123"}'
```

---

## 🔑 Environment Variables (`.env`)

```
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=
```
