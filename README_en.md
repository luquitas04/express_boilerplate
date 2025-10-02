# 🚀 Express + TypeORM + JWT Boilerplate

Boilerplate project for **Express (Node.js)** using **JavaScript**, with **Postgres + TypeORM**, **JWT authentication**, and a default **User entity**.  

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

## 📂 Structure

```
src/
├─ entities/        # User entity (TypeORM)
├─ middlewares/     # Auth middleware (JWT)
├─ routes/          # auth.js, users.js
├─ migrations/      # TypeORM migrations
├─ data-source.js   # TypeORM DataSource
├─ index.js         # Express entrypoint
└─ seed.js          # Seed default admin
```

---

## ⚙️ Installation & Usage

```bash
# Install dependencies
npm install

# Run dev mode
npm run dev

# Run seed to create default admin
npm run seed
```

Test login:
```bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@local.test","password":"admin123"}'
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

---

## 🛠 Scripts
- `npm run dev` → development with nodemon  
- `npm start` → production  
- `npm run seed` → create default admin  
- `npm run migration:generate` → generate migration  
- `npm run migration:run` → run migrations  
- `npm run migration:revert` → revert last migration  

---

## 🌍 API Endpoints

- `GET /health` → health check  
- **Auth**:  
  - `POST /auth/register` → register user  
  - `POST /auth/login` → login user  
  - `GET /auth/me` → current profile (Bearer token)  
- **Users** (auth required):  
  - `GET /users` → list users  
  - `POST /users` → create user (admin)  
  - `GET /users/:id` → get by ID  
  - `PATCH /users/:id` → update user (admin)  
  - `DELETE /users/:id` → delete user (admin)  
