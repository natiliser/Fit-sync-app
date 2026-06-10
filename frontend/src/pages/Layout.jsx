// src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Dumbbell, Apple, Scale, ChefHat, Home, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, path: '/home', label: 'Home' },
        { icon: BarChart2, path: '/progress', label: 'Progress' },
        { icon: Dumbbell, path: '/workouts', label: 'Workouts' },
        { icon: Apple, path: '/meals-diary', label: 'Nutrition' },
        { icon: Scale, path: '/measurements', label: 'Measures' },
        { icon: ChefHat, path: '/recipes', label: 'Recipes' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div
            className="flex min-h-screen w-full"
            style={{
                backgroundImage: "url('/images/bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Sidebar - Fixed width of w-24 (6rem / 96px) */}
            <div className="w-24 bg-[#26215C] flex flex-col items-center pt-6 pb-4 gap-6 fixed top-0 left-0 h-screen z-10 shadow-xl">
                
                {/* Logo */}
                <div className="w-12 h-12 bg-[#7F77DD] rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md">
                    F
                </div>

                {/* Nav items */}
                <div className="flex flex-col gap-4 flex-1">
                    {navItems.map(({ icon: Icon, path, label }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            title={label}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                                ${location.pathname === path
                                    ? 'bg-white/20 text-white shadow-inner'
                                    : 'text-white/40 hover:bg-white/10 hover:text-white/70'
                                }`}
                        >
                            <Icon size={24} />
                        </button>
                    ))}
                </div>

                {/* Logout at bottom */}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="mt-auto mb-2 w-10 h-10 rounded-lg flex items-center justify-center text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                    <LogOut size={22} />
                </button>
            </div>

        
            <main className="ml-24 flex-1 min-h-screen p-4 md:p-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;