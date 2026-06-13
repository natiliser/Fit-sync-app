import { useState } from 'react';
import { Settings, ChefHat, Apple , ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminRecipes from './AdminRecipes';
import AdminFoodItems from './AdminFoodItems'; 

const AdminDashboard = () => {
    const navigate = useNavigate();
    // מנהל איזו לשונית פתוחה כרגע (ברירת מחדל: מתכונים)
    const [activeTab, setActiveTab] = useState('recipes');

    return (
        <div className="max-w-6xl mx-auto mt-8 p-4 font-sans">
            
            {/* Main panel header */}
            <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-white shadow-lg flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-2xl">
                    <Settings size={32} className="text-violet-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Admin Control Center</h1>
                    <p className="text-slate-400 mt-1">Manage global database entries and configurations</p>
                </div>
            </div>

            {/* Tab navigation */}
        
            <div className="flex gap-4 mb-8 border-b border-gray-200 pb-px">
                <button
                    onClick={() => setActiveTab('recipes')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-lg transition-all border-b-2 ${
                        activeTab === 'recipes' 
                        ? 'border-violet-600 text-violet-700' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <ChefHat size={20} />
                    Recipes Database
                </button>
                
                <button
                    onClick={() => setActiveTab('foodItems')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold text-lg transition-all border-b-2 ${
                        activeTab === 'foodItems' 
                        ? 'border-green-600 text-green-700' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Apple size={20} />
                    Food Items Database
                </button>
            </div>

            {/* Here comes recipe && food components */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'recipes' && <AdminRecipes />}

                {activeTab === 'foodItems' && <AdminFoodItems />}
            </div>
        </div>
    );
};

export default AdminDashboard;