# 🚀 Express + TypeORM + JWT Boilerplate

Proyecto boilerplate para **Express (Node.js)** usando **JavaScript**, con **Postgres + TypeORM**, **autenticación JWT** y una **entidad User** por defecto.  

---

## ✅ Qué incluye
- ⚡ **Express (JS)** con helmet, cors, morgan.  
- 🗄️ **Postgres + TypeORM** configurado con `.env`.  
- 👤 **Entidad User** con rol (`admin` | `user`).  
- 🔑 **Autenticación** (JWT login, registro, perfil `/me`).  
- 🛠 **Rutas CRUD** de usuarios (protegidas, solo admin para mutaciones).  
- 🌱 **Seed script** para crear un admin por defecto.  
- 📦 **Nodemon** para desarrollo.  
- 📑 Listo para **migraciones**.  

---

## 📂 Estructura

```
src/
├─ entities/        # Entidad User (TypeORM)
├─ middlewares/     # Middleware de auth (JWT)
├─ routes/          # auth.js, users.js
├─ migrations/      # Migraciones TypeORM
├─ data-source.js   # Configuración de DataSource
├─ index.js         # Entrada principal Express
└─ seed.js          # Seed admin por defecto
```

---

## ⚙️ Instalación y uso

```bash
# Instalar dependencias
npm install

# Ejecutar en modo dev
npm run dev

# Crear admin por defecto
npm run seed
```

Probar login:
```bash
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@local.test","password":"admin123"}'
```

---

## 🔑 Variables de entorno (`.env`)

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
- `npm run dev` → desarrollo con nodemon  
- `npm start` → producción  
- `npm run seed` → crea admin por defecto  
- `npm run migration:generate` → genera migración  
- `npm run migration:run` → aplica migraciones  
- `npm run migration:revert` → revierte última migración  

---

## 🌍 Endpoints de la API

- `GET /health` → chequeo de estado  
- **Auth**:  
  - `POST /auth/register` → registrar usuario  
  - `POST /auth/login` → iniciar sesión  
  - `GET /auth/me` → perfil actual (Bearer token)  
- **Users** (requiere auth):  
  - `GET /users` → listar usuarios  
  - `POST /users` → crear usuario (admin)  
  - `GET /users/:id` → obtener por ID  
  - `PATCH /users/:id` → actualizar usuario (admin)  
  - `DELETE /users/:id` → eliminar usuario (admin)  
