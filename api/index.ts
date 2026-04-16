import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Use existing models if they exist (important for Vercel hot-reloads)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// --- Database Connection Helper ---
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
};

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

// --- Routes ---
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.json({ status: 'ok', database: 'error', message: (err as Error).message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    await connectDB();
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
    await connectDB();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, email: user.email, displayName: user.displayName, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tasks', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks.map(t => ({ ...t.toObject(), id: t._id })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

app.post('/api/tasks', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const task = new Task({ ...req.body, userId: req.user.id });
    await task.save();
    res.json({ ...task.toObject(), id: task._id });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

app.patch('/api/tasks/:id', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ ...task.toObject(), id: task._id });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

app.get('/api/admin/stats', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);
    if (user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    res.json({ totalUsers, totalTasks, completedTasks });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default app;
