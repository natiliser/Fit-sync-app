import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            // Send POST request to the server with the email to recover
            const response = await axios.post('http://localhost:5000/users/forgot-password', { email });
            setMessage(response.data.message || 'Reset link sent successfully! Check your email.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" dir="ltr">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Back button to login page */}
                <button 
                    onClick={() => navigate('/login')} 
                    className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors mb-6 mx-auto sm:mx-0"
                >
                    <ArrowLeft size={16} /> Back to Login
                </button>

                <h2 className="text-center text-3xl font-extrabold text-gray-800 tracking-tight">
                    Forgot Password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    No worries! Enter your email and we'll send you a reset link.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    
                    {/* Display success message */}
                    {message && (
                        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start gap-3 text-sm">
                            <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                            <p>{message}</p>
                        </div>
                    )}

                    {/* Display error message */}
                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-gray-50/50 transition-all text-sm"
                                    placeholder="Enter your registered email"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={18} className="animate-spin" />
                                        Sending Link...
                                    </div>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;