import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home'
import ProfileSetup from './pages/ProfileSetup';
import MealsDiary from './pages/MealsDiary';
import Measurements from './pages/Measurements'
import Workouts from './pages/Workouts';
import Progress from './pages/Progress';
import Recipes from './pages/Recipes'
import AdminRoute from './components/AdminRoute';
import AdminRecipes from './components/AdminRecipes';
import AdminDashboard from './components/AdminDashboard';

function App() {

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="min-h-screen bg-gray-50 py-10">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/meals-diary" element={<MealsDiary />} />
            <Route path='/measurements' element={<Measurements />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/recipes" element={<Recipes />} />
            {/* נתיב מוגן למנהלים בלבד! */}
            <Route
              path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* נתיב מוגן למנהלים בלבד! */}
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;