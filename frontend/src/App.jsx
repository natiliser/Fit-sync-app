import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home'
import ProfileSetup from './pages/ProfileSetup';

function App() {
  // Replace with your actual Google Client ID
  const clientId = "530621194804-4a7cn9ra0q1bu3bko8kcevj8h300qtnv.apps.googleusercontent.com"; 

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
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;