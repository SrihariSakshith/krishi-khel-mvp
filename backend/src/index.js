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
const missionRoutes = require('./api/missions.routes'); // New
const diagnoseRoutes = require('./api/diagnose.routes'); // New

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/missions', missionRoutes); // New
app.use('/api/diagnose', diagnoseRoutes); // New

app.get('/', (req, res) => {
  res.send('Krishi Khel Backend is running!');
});

cronJobs.startDailyJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  seedDatabase().catch(e => console.error("Seeding database failed:", e));
});