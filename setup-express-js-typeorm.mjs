#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const projectName = process.argv[2] || "express-js-typeorm-app";
const root = join(process.cwd(), projectName);
const run = (cmd) => execSync(cmd, { stdio: "inherit", cwd: root });
const j = (o) => JSON.stringify(o, null, 2);

async function askDBConfig() {
  const rl = readline.createInterface({ input, output });
  try {
    const DB_HOST =
      (await rl.question("DB host (default: localhost): ")) || "localhost";
    const DB_PORT = (await rl.question("DB port (default: 5432): ")) || "5432";
    const DB_USER =
      (await rl.question("DB user (default: postgres): ")) || "postgres";
    const DB_PASSWORD = await rl.question("DB password: ");
    const DB_NAME =
      (await rl.question(
        `DB name (default: ${projectName.replace(/-/g, "_")}): `
      )) || projectName.replace(/-/g, "_");
    const PORT = (await rl.question("API port (default: 3000): ")) || "3000";
    const SYNC = (
      (await rl.question("Use synchronize=true (dev)? [Y/n]: ")) || "Y"
    )
      .toLowerCase()
      .startsWith("y");
    const JWT_SECRET =
      (await rl.question("JWT secret (leave blank to autogenerate): ")) ||
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const JWT_EXPIRES_IN =
      (await rl.question("JWT expiresIn (default: 7d): ")) || "7d";
    return {
      DB_HOST,
      DB_PORT,
      DB_USER,
      DB_PASSWORD,
      DB_NAME,
      PORT,
      SYNC,
      JWT_SECRET,
      JWT_EXPIRES_IN,
    };
  } finally {
    rl.close();
  }
}

(async function main() {
  if (existsSync(root)) {
    console.error(`❌ La carpeta "${projectName}" ya existe.`);
    process.exit(1);
  }

  const cfg = await askDBConfig();

  mkdirSync(root, { recursive: true });
  [
    "src",
    "src/entities",
    "src/routes",
    "src/middlewares",
    "src/migrations",
  ].forEach((p) => mkdirSync(join(root, p), { recursive: true }));

  run("npm init -y");
  const pkgPath = join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = projectName;
  pkg.type = "commonjs";
  pkg.scripts = {
    start: "node src/index.js",
    dev: "nodemon src/index.js",
    seed: "node src/seed.js",
    "migration:generate":
      "node ./node_modules/typeorm/cli.js migration:generate -d src/data-source.js src/migrations/auto",
    "migration:run":
      "node ./node_modules/typeorm/cli.js migration:run -d src/data-source.js",
    "migration:revert":
      "node ./node_modules/typeorm/cli.js migration:revert -d src/data-source.js",
  };
  writeFileSync(pkgPath, j(pkg));

  run(
    "npm i express dotenv cors helmet morgan typeorm pg bcryptjs jsonwebtoken"
  );
  run("npm i -D nodemon");

  writeFileSync(
    join(root, ".gitignore"),
    `node_modules
dist
.env
`
  );

  writeFileSync(
    join(root, ".env"),
    `PORT=${cfg.PORT}
DB_HOST=${cfg.DB_HOST}
DB_PORT=${cfg.DB_PORT}
DB_USER=${cfg.DB_USER}
DB_PASSWORD=${cfg.DB_PASSWORD}
DB_NAME=${cfg.DB_NAME}
JWT_SECRET=${cfg.JWT_SECRET}
JWT_EXPIRES_IN=${cfg.JWT_EXPIRES_IN}
`
  );

  writeFileSync(
    join(root, "nodemon.json"),
    j({ watch: ["src"], ext: "js,json", exec: "node src/index.js" })
  );

  writeFileSync(
    join(root, "src", "data-source.js"),
    `require('dotenv').config();
const { DataSource } = require('typeorm');
const User = require('./entities/User');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: ${cfg.SYNC ? "true" : "false"},
  logging: false,
  entities: [User],
  migrations: ['src/migrations/*.js'],
});

module.exports = { AppDataSource };
`
  );

  writeFileSync(
    join(root, "src", "entities", "User.js"),
    `const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    email: { type: 'varchar', unique: true },
    passwordHash: { name: 'password_hash', type: 'varchar' },
    fullName: { name: 'full_name', type: 'varchar', nullable: true },
    role: { type: 'varchar', default: 'user' },
    isActive: { name: 'is_active', type: 'boolean', default: true },
    createdAt: { name: 'created_at', type: 'timestamp', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamp', updateDate: true },
  },
  indices: [{ name: 'idx_users_email', columns: ['email'], unique: true }],
});
`
  );

  writeFileSync(
    join(root, "src", "middlewares", "auth.js"),
    `const jwt = require('jsonwebtoken');

function auth(requiredRole) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [, token] = header.split(' ');
      if (!token) return res.status(401).json({ error: 'token requerido' });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole) return res.status(403).json({ error: 'forbidden' });
      next();
    } catch (e) {
      return res.status(401).json({ error: 'token inválido' });
    }
  };
}

module.exports = { auth };
`
  );

  writeFileSync(
    join(root, "src", "routes", "auth.js"),
    `const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');
const { auth } = require('../middlewares/auth');

const router = Router();

function signToken(user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' });
    const repo = AppDataSource.getRepository('User');
    const exists = await repo.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'email ya registrado' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = repo.create({ email, passwordHash, fullName: fullName || null, role: role || 'user' });
    await repo.save(user);
    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (e) {
    return res.status(500).json({ error: 'error registrando' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' });
    const repo = AppDataSource.getRepository('User');
    const user = await repo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'credenciales inválidas' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'credenciales inválidas' });
    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (e) {
    return res.status(500).json({ error: 'error autenticando' });
  }
});

router.get('/me', auth(), async (req, res) => {
  const repo = AppDataSource.getRepository('User');
  const user = await repo.findOne({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: 'no encontrado' });
  delete user.passwordHash;
  res.json(user);
});

module.exports = router;
`
  );

  writeFileSync(
    join(root, "src", "routes", "users.js"),
    `const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('../data-source');
const { auth } = require('../middlewares/auth');

const router = Router();

router.get('/', auth(), async (req, res) => {
  const repo = AppDataSource.getRepository('User');
  const users = await repo.find({ select: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt', 'updatedAt'] });
  res.json(users);
});

router.post('/', auth('admin'), async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email y password son requeridos' });
    const repo = AppDataSource.getRepository('User');
    const exists = await repo.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'email ya registrado' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = repo.create({ email, passwordHash, fullName: fullName || null, role: role || 'user' });
    await repo.save(user);
    res.status(201).json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, isActive: user.isActive });
  } catch (e) {
    res.status(500).json({ error: 'error creando usuario' });
  }
});

router.get('/:id', auth(), async (req, res) => {
  const repo = AppDataSource.getRepository('User');
  const user = await repo.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'no encontrado' });
  delete user.passwordHash;
  res.json(user);
});

router.patch('/:id', auth('admin'), async (req, res) => {
  const repo = AppDataSource.getRepository('User');
  const user = await repo.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'no encontrado' });
  const { fullName, role, isActive, password } = req.body || {};
  if (fullName !== undefined) user.fullName = fullName;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = !!isActive;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);
  await repo.save(user);
  delete user.passwordHash;
  res.json(user);
});

router.delete('/:id', auth('admin'), async (req, res) => {
  const repo = AppDataSource.getRepository('User');
  const user = await repo.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'no encontrado' });
  await repo.remove(user);
  res.status(204).end();
});

module.exports = router;
`
  );

  writeFileSync(
    join(root, "src", "seed.js"),
    `require('dotenv').config();
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('./data-source');

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository('User');
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@local.test';
  const pass = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const fullName = process.env.SEED_ADMIN_NAME || 'Admin';
  const role = 'admin';
  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log('Admin ya existe:', email);
    await AppDataSource.destroy();
    return;
  }
  const passwordHash = await bcrypt.hash(pass, 10);
  const admin = repo.create({ email, passwordHash, fullName, role, isActive: true });
  await repo.save(admin);
  console.log('Admin creado:', { email, pass });
  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
`
  );

  writeFileSync(
    join(root, "src", "index.js"),
    `require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { AppDataSource } = require('./data-source');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.use('/auth', authRouter);
app.use('/users', usersRouter);
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('✅ DB conectada');
    app.listen(PORT, () => console.log('🚀 API en http://localhost:' + PORT));
  })
  .catch((err) => {
    console.error('❌ Error inicializando DataSource:', err?.message || err);
    process.exit(1);
  });
`
  );

  console.log(`
✅ Proyecto creado en: ${projectName}

Siguientes pasos:
  cd ${projectName}
  npm run dev
  npm run seed
`);
})().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
