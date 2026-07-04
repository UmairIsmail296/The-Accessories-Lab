const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Make io accessible
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
const cron = require('node-cron');
const { exec } = require('child_process');

// Roz raat 2 baje scraper chalega
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled scraper...');
  exec('node scrapers/scrapeProducts.js', (error, stdout, stderr) => {
    if (error) console.error('Scraper error:', error);
    console.log(stdout);
  });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});