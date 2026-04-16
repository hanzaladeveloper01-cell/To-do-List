import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { JSONFilePreset } from 'lowdb/node';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'taskmaster-super-secret-key';

// --- Database Setup (Local JSON file acting as MongoDB) ---
const defaultData = { users: [], tasks: [] };
const db = await JSONFilePreset('db.json', defaultData);

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  const user = db.data.users.find((u: any) => u.id === req.user.id);
  if (user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- Auth Routes ---
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, displayName } = req.body;
    
    if (db.data.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword,
        displayName,
        role: db.data.users.length === 0 ? 'admin' : 'user', // First user is admin
        createdAt: Date.now()
      };

      db.data.users.push(newUser);
      await db.write();

      const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
      res.json({ 
        token, 
        user: { id: newUser.id, email: newUser.email, displayName: newUser.displayName, role: newUser.role } 
      });
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating user' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.data.users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } 
    });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.data.users.find((u: any) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email, displayName: user.displayName, role: user.role });
  });

  // --- Task Routes ---
  app.get('/api/tasks', authenticateToken, (req: any, res) => {
    const userTasks = db.data.tasks.filter((t: any) => t.userId === req.user.id);
    res.json(userTasks);
  });

  app.post('/api/tasks', authenticateToken, async (req: any, res) => {
    const newTask = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      userId: req.user.id,
      createdAt: Date.now()
    };
    db.data.tasks.push(newTask);
    await db.write();
    res.json(newTask);
  });

  app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    const index = db.data.tasks.findIndex((t: any) => t.id === req.params.id && t.userId === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'Task not found' });

    db.data.tasks[index] = { ...db.data.tasks[index], ...req.body };
    await db.write();
    res.json(db.data.tasks[index]);
  });

  app.delete('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    const initialLength = db.data.tasks.length;
    db.data.tasks = db.data.tasks.filter((t: any) => !(t.id === req.params.id && t.userId === req.user.id));
    
    if (db.data.tasks.length === initialLength) return res.status(404).json({ message: 'Task not found' });
    
    await db.write();
    res.sendStatus(204);
  });

  app.delete('/api/tasks/completed/clear', authenticateToken, async (req: any, res) => {
    db.data.tasks = db.data.tasks.filter((t: any) => !(t.userId === req.user.id && t.completed));
    await db.write();
    res.sendStatus(204);
  });

  // --- Admin Routes ---
  app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    const users = db.data.users.map(({ password, ...u }: any) => ({ ...u, uid: u.id }));
    res.json(users);
  });

  app.patch('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    const index = db.data.users.findIndex((u: any) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });

    db.data.users[index].role = req.body.role;
    await db.write();
    res.json(db.data.users[index]);
  });

  app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
    res.json({
      totalUsers: db.data.users.length,
      totalTasks: db.data.tasks.length,
      completedTasks: db.data.tasks.filter((t: any) => t.completed).length
    });
  });

  // --- Vite / Static Files ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
