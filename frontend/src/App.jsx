import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmPlanner from './pages/FarmPlanner';
import Groups from './pages/Groups';
import Missions from './pages/Missions';
import PestDetector from './pages/PestDetector';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import Schemes from './pages/Schemes'; // New Import
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { authToken } = useAuth();
  const location = useLocation();
  if (!authToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/missions" element={<Missions />} />
                <Route path="/planner" element={<FarmPlanner />} />
                <Route path="/diagnose" element={<PestDetector />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/schemes" element={<Schemes />} /> {/* New Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;