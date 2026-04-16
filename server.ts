import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'taskmaster-elite-secret-key';

// --- MongoDB Schemas ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Number, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  dueDate: { type: String },
  createdAt: { type: Number, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error checking admin status' });
  }
};

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB only if URI is provided
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB Atlas');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  } else {
    console.warn('MONGODB_URI not found. Database features will not work.');
  }

  // --- Health Check ---
  app.get('/api/health', (req, res) => res.json({ status: 'ok', database: MONGODB_URI ? 'connected' : 'missing' }));

  // --- Auth Routes ---
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, displayName } = req.body;
    try {
      if (!MONGODB_URI) throw new Error('Database not configured. Please add MONGODB_URI to secrets.');
      
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ 
        email, 
        password: hashedPassword, 
        displayName,
        role: (await User.countDocuments()) === 0 ? 'admin' : 'user'
      });
      await user.save();
      
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!MONGODB_URI) throw new Error('Database not configured.');
      
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ id: user._id, email: user.email, displayName: user.displayName, role: user.role });
    } catch (err: any) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // --- Task Routes ---
  app.get('/api/tasks', authenticateToken, async (req: any, res) => {
    try {
      const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json(tasks.map(t => ({ ...t.toObject(), id: t._id })));
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  });

  app.post('/api/tasks', authenticateToken, async (req: any, res) => {
    try {
      const task = new Task({ ...req.body, userId: req.user.id });
      await task.save();
      res.json({ ...task.toObject(), id: task._id });
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating task' });
    }
  });

  app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ ...task.toObject(), id: task._id });
    } catch (err: any) {
      res.status(500).json({ message: 'Error updating task' });
    }
  });

  app.delete('/api/tasks/:id', authenticateToken, async (req: any, res) => {
    try {
      const result = await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Task not found' });
      res.sendStatus(204);
    } catch (err: any) {
      res.status(500).json({ message: 'Error deleting task' });
    }
  });

  app.delete('/api/tasks/completed/clear', authenticateToken, async (req: any, res) => {
    try {
      await Task.deleteMany({ userId: req.user.id, completed: true });
      res.sendStatus(204);
    } catch (err: any) {
      res.status(500).json({ message: 'Error clearing tasks' });
    }
  });

  // --- Admin Routes ---
  app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users.map(u => ({ ...u.toObject(), uid: u._id })));
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

  app.patch('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: 'Error updating user role' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalTasks = await Task.countDocuments();
      const completedTasks = await Task.countDocuments({ completed: true });
      res.json({ totalUsers, totalTasks, completedTasks });
    } catch (err: any) {
      res.status(500).json({ message: 'Error fetching stats' });
    }
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
