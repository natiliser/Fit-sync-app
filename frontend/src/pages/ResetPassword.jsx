import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams(); // Extract the token from the URL
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Send the new password and the token to the server
            await axios.post(`http://localhost:5000/users/reset-password/${token}`, { password });
            setMessage('Password updated successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-800">Set New Password</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow rounded-2xl border border-gray-100">
                    {message && <div className="mb-4 text-emerald-600 text-sm font-semibold text-center">{message}</div>}
                    {error && <div className="mb-4 text-red-600 text-sm font-semibold text-center">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full p-2.5 border rounded-xl bg-gray-50"
                                placeholder="Enter new password"
                            />
                        </div>
                        <button disabled={loading} className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-semibold">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;