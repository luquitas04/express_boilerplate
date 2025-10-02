# 🚀 Express + TypeORM + JWT Boilerplate

Proyecto boilerplate para **Express (Node.js)** usando **JavaScript**, con **Postgres + TypeORM**, **autenticación JWT** y una **entidad User** por defecto.  

---

## ⚙️ Inicialización

```bash
# Crear un nuevo proyecto desde el script generador
node setup-express-js-typeorm.mjs mi-api

cd mi-api
npm install
```

---

## ✅ Qué incluye
- ⚡ **Express (JS)** con helmet, cors, morgan.  
- 🗄️ **Postgres + TypeORM** configurado con `.env`.  
- 👤 **Entidad User** con rol (`admin` | `user`).  
- 🔑 **Autenticación** con JWT (login, registro, perfil `/me`).  
- 🛠 **Rutas CRUD** de usuarios (protegidas, solo admin para mutaciones).  
- 🌱 **Seed script** para crear un admin por defecto.  
- 📦 **Nodemon** para desarrollo.  
- 📑 Listo para **migraciones**.  

---

## ⚙️ Uso

```bash
# Ejecutar en modo dev
npm run dev

# Crear admin por defecto (admin@local.test / admin123)
npm run seed
```

Probar login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.test","password":"admin123"}'
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
