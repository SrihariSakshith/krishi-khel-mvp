require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cronJobs = require('./jobs/daily.jobs');
const { seedDatabase } = require('./seed');

// Import routes
const authRoutes = require('./api/auth.routes');
const userRoutes = require('./api/user.routes');
const plannerRoutes = require('./api/planner.routes');
const groupRoutes = require('./api/groups.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- EXPLICIT CORS CONFIGURATION ---
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only the frontend to connect
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));
// --- END OF CORS CONFIGURATION ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/groups', groupRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Krishi Khel Backend is running!');
});

// Start Cron Jobs
cronJobs.startDailyJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Run seed function after server starts
  seedDatabase().catch(e => console.error("Seeding database failed:", e));
});