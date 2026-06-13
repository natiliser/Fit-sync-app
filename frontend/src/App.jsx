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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'

import AdminRoute from './components/AdminRoute';
import AdminRecipes from './components/AdminRecipes';
import AdminDashboard from './components/AdminDashboard';

import Layout from './pages/Layout';

function App() {

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Layout><Home /></Layout>} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/meals-diary" element={<Layout><MealsDiary /></Layout>} />
            <Route path='/measurements' element={<Layout><Measurements /></Layout>} />
            <Route path="/workouts" element={<Layout><Workouts /></Layout>} />
            <Route path="/progress" element={<Layout><Progress /></Layout>} />
            <Route path="/recipes" element={<Layout><Recipes /></Layout>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* Protected route: for administrators only! */}
            <Route
              path="/admin" element={
                <Layout>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
                </Layout>
              }
            />
            {/* Protected route: for administrators only! */}
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;