import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Target, User, Save, Zap } from 'lucide-react';
import axios from 'axios';

const ProfileSetup = () => {
    const navigate = useNavigate();

    
    const [formData, setFormData] = useState({
        age: '',
        gender: 'male',
        height: '',
        startWeight: '',
        goalWeight: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        
        const { gender, age, height, startWeight, goalWeight } = formData;
        const weight = parseFloat(startWeight);
        const h = parseFloat(height);
        const a = parseInt(age);
        const isMale = gender === 'male';
        const goal = parseFloat(goalWeight);

 
        let bmr = isMale
            ? (10 * weight) + (6.25 * h) - (5 * a) + 5
            : (10 * weight) + (6.25 * h) - (5 * a) - 161;

        let tdee = bmr * 1.55;

    
        let targetCalories = tdee;
        if (goal < weight) {
            targetCalories -= 400; 
        } else if (goal > weight) {
            targetCalories += 300;
        }

        // חישוב מאקרו להתאוששות ושמירה על שריר
        const protein = Math.round(weight * 2.2);
        const fat = Math.round((targetCalories * 0.25) / 9);
        const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

        // 3. מכינים את החבילה הסופית שכוללת גם את התוצאות של החישוב
        const finalData = {
            ...formData,
            calories: Math.round(targetCalories),
            protein,
            carbs,
            fat
        };

        // 4. שליחה לשרת
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/users/profile', finalData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // מעבר לעמוד הבית אחרי שמירה מוצלחת
            navigate('/home');

        } catch (error) {
            // זה ידפיס לנו בדיוק מה השרת אמר
            console.error("Full error response:", error.response?.data);
            alert(`Error saving profile: ${error.response?.data?.msg || "Check server logs"}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-4 font-sans">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Let's set up your profile</h1>
                <p className="text-gray-500">Just a few details so we can tailor your fitness plan</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">

                {/* פס עיצוב עליון */}
                <div className="h-2 bg-violet-500 w-full"></div>

                <div className="p-8">
                    <div className="flex items-center gap-2 mb-8 border-b pb-4">
                        <User className="text-violet-500" size={24} />
                        <h2 className="text-2xl font-bold text-gray-700">Physical Stats</h2>
                    </div>

                    <div className="space-y-6">
                        {/* שורת מגדר וגיל */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-shadow"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 30" required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-shadow" />
                            </div>
                        </div>

                        {/* שורת גובה */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Height (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 175" required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-shadow" />
                        </div>

                        {/* שורת משקלים */}
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                    <Scale size={16} className="text-violet-400" /> Current Weight (kg)
                                </label>
                                <input type="number" step="0.1" name="startWeight" value={formData.startWeight} onChange={handleChange} placeholder="e.g. 80.5" required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                    <Target size={16} className="text-violet-400" /> Goal Weight (kg)
                                </label>
                                <input type="number" step="0.1" name="goalWeight" value={formData.goalWeight} onChange={handleChange} placeholder="e.g. 75.0" required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-shadow" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-violet-50 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-violet-600 text-sm font-medium">
                        <Zap size={18} />
                        <span>Macros will be auto-calculated</span>
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <Save size={20} />
                        Save & Continue
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSetup;