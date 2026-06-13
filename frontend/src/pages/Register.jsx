import { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const Register = () => {
const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        try {
            const response = await axios.post('http://localhost:5000/users/register', formData);
            setMessage(response.data.msg);

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.log("Server error response:" , error.response?.data);
            if (error.response && error.response.data) {
                setMessage(error.response.data.msg);
            } else {
                setMessage('An error occurred during registration');
            }
        }
    };

    return (
        
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg border border-gray-100 font-sans">
            <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
                Create an Account
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                
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
                
                <button 
                    type="submit" 
                    className="p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors mt-2"
                >
                    Register
                </button>
            </form>

            {/* Dynamic message styling based on success or error */}
            {message && (
                <p className={`mt-6 text-center font-semibold ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default Register;