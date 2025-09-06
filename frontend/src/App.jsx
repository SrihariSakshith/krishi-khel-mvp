import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmPlanner from './pages/FarmPlanner';
import Groups from './pages/Groups';
import Missions from './pages/Missions'; // New
import PestDetector from './pages/PestDetector'; // New
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