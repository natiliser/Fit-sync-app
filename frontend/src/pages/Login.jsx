import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle standard email/password login
    const handleStandardLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/users/login', formData);
            
            // 1. שמירת ה-Token
            localStorage.setItem('token', response.data.token);
            
            // 2. ניתוב חכם: האם למשתמש יש כבר משקל התחלתי?
            const user = response.data.user;
            
            if (!user.startWeight) {
                // משתמש חדש שעוד לא מילא פרטים
                navigate('/profile-setup');
            } else {
                // משתמש ותיק שכבר מילא פרטים
                navigate('/home');
            }
            
        } catch (error) {
            setMessage(error.response?.data?.msg || 'Login failed');
        }
    };

    // Handle Google login success
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post('http://localhost:5000/users/google', {
                token: credentialResponse.credential
            });
            
            // שמירת ה-Token
            localStorage.setItem('token', response.data.token);
            
            // שליפת פרטי המשתמש מהתשובה של השרת
            const user = response.data.user;
            
            // ניתוב חכם
            if (user.startWeight === null || user.startWeight === undefined || user.startWeight === 0){
                // משתמש גוגל חדש (או כזה שעוד לא מילא פרטים)
                navigate('/profile-setup');
            } else {
                // משתמש גוגל קיים שכבר מילא פרטים
                navigate('/home');
            }
            
            setMessage("Google Login successful!");
            console.log("FitSync Token:", response.data.token);
        } catch (error) {
            setMessage('Google authentication failed on our server');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg border border-gray-100 font-sans">
            <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
                Welcome to FitSync
            </h2>

            {/* Standard Login Form */}
            <form onSubmit={handleStandardLogin} className="flex flex-col gap-5">
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />

                <button type="submit" className="p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2">
                    Login
                </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center justify-center">
                <span className="w-1/5 border-b border-gray-300"></span>
                <span className="text-xs text-gray-500 uppercase px-2">Or continue with</span>
                <span className="w-1/5 border-b border-gray-300"></span>
            </div>

            {/* Google Login Button Container */}
            <div className="flex justify-center mb-6">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setMessage('Google Login Failed')}
                />
            </div>

            {/* Link to Register Page */}
            <div className="text-center mt-4 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                    Register here
                </Link>
            </div>

            {/* Forgot password */}
            <div className="text-center mt-4 text-sm text-gray-600">
                Forgot the password?{' '}
                <Link to="/forgot-password" className="text-blue-600 font-bold hover:underline">
                    Reset password
                </Link>
            </div>

            {message && (
                <p className={`mt-4 text-center font-semibold ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default Login;