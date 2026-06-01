import { useNavigate } from 'react-router-dom';
import { Target, TrendingDown, BarChart2, Dumbbell, Apple, Scale, ArrowRight, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // מתחילים עם נתונים מאופסים עד שהשרת יענה
    const [weightData, setWeightData] = useState({
        currentWeight: 0,
        goalWeight: 0,
        startWeight: 0
    });

    const [macroData, setMacroData] = useState({
        calories: { current: 0, target: 0 },
        protein: { current: 0, target: 0 },
        carbs: { current: 0, target: 0 },
        fat: { current: 0, target: 0 }
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // פנייה לשרת
                const response = await axios.get('http://localhost:5000/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const user = response.data;

                // מעדכנים את הסטייט עם הנתונים האמיתיים מה-Database!
                setWeightData({
                    currentWeight: user.startWeight || 0, // כרגע משקל נוכחי שווה להתחלתי
                    goalWeight: user.goalWeight || 0,
                    startWeight: user.startWeight || 0
                });

                setMacroData({
                    calories: { current: 0, target: user.dailyTargets?.calories || 0 },
                    protein: { current: 0, target: user.dailyTargets?.protein || 0 },
                    carbs: { current: 0, target: user.dailyTargets?.carbs || 0 },
                    fat: { current: 0, target: user.dailyTargets?.fat || 0 }
                });

            } catch (error) {
                console.error("Error fetching user data", error);
            }
        };

        fetchUserData();
    }, [navigate]);



    // Fitness Tips Array
    const fitnessTips = [ 
    "Drink at least 2-3 liters of water a day to keep your metabolism active.", 
    "Protein is the building block of your muscles. Aim for at least 1.6g per kg of body weight.", 
    "Sleep is when the magic happens! Aim for 7-8 hours of quality sleep for optimal recovery.", 
    "Consistency beats intensity. A moderate workout you do every day is better than a hard one once a month.", 
    "Don't skip leg day! The largest muscles in your body burn the most calories.", 
    "Focus on progressive overload: try to lift a little heavier or do one more rep than last week.", 
    "Carbs are not the enemy! They provide the energy you need for intense workouts.",
    "Warm up before every session — cold muscles are injury-waiting-to-happen.",
    "Rest days are not lazy days. Muscles grow during recovery, not during the workout.",
    "Track your workouts. What gets measured gets improved.",
    "Compound movements like squats, deadlifts, and bench press give you the most bang for your buck.",
    "Healthy fats from avocados, nuts, and olive oil support hormone production — including testosterone.",
    "Your workout starts in the kitchen. You can't out-train a bad diet.",
    "Stretching after a workout reduces soreness and improves long-term flexibility.",
    "Mental health is fitness too. Exercise reduces cortisol and boosts serotonin naturally.",
    "Don't compare your chapter 1 to someone else's chapter 10. Progress is personal.",
    "A 20-minute walk is still better than zero minutes on the couch.",
    "Creatine is one of the most researched and proven supplements — safe, effective, and affordable.",
    "Breathing matters: exhale on exertion, inhale on the way back.",
    "The best workout is the one you actually show up for."
];

    // State for the random tip
    const [dailyTip, setDailyTip] = useState("");

    // Set a random tip when the component loads
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * fitnessTips.length);
        setDailyTip(fitnessTips[randomIndex]);
    }, []);

    // Calculate progress percentage for the Weight Progress Bar
    const calculateWeightProgress = () => {
        const totalToLose = weightData.startWeight - weightData.goalWeight;
        const lostSoFar = weightData.startWeight - weightData.currentWeight;
        const percentage = Math.min(Math.max((lostSoFar / totalToLose) * 100, 0), 100);
        return percentage.toFixed(0);
    };

    const progress = calculateWeightProgress();
    const remainingWeight = (weightData.currentWeight - weightData.goalWeight).toFixed(1);

    // Data array for the Quick Actions cards
    const quickActions = [
        { 
            title: 'Progress', 
            subtitle: 'View charts & stats', 
            icon: BarChart2, 
            color: 'text-blue-500', 
            bgColor: 'bg-blue-50' 
        },
        { 
            title: 'Workouts', 
            subtitle: 'Log a new workout', 
            icon: Dumbbell, 
            color: 'text-orange-500', 
            bgColor: 'bg-orange-50' 
        },
        { 
            title: 'Nutrition', 
            subtitle: 'Track your meals', 
            icon: Apple, 
            color: 'text-green-500', 
            bgColor: 'bg-green-50' 
        },
        { 
            title: 'Measurements', 
            subtitle: 'Add new body stats', 
            icon: Scale, 
            color: 'text-purple-500', 
            bgColor: 'bg-purple-50' 
        },
    ];

    return (
        <div className="max-w-6xl mx-auto mt-10 p-4 font-sans">
            
            {/* Purple Top Banner */}
            <div className="bg-violet-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Target className="text-red-400" size={28} />
                    <h1 className="text-3xl font-bold">Welcome to your fitness journey!</h1>
                </div>
                <p className="text-violet-200 mb-6 text-lg">
                    Track your weight, nutrition, and workouts all in one place
                </p>

                {/* Weight Data Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-violet-500/50 rounded-xl p-4 flex flex-col justify-center">
                        <span className="text-violet-200 text-sm mb-1">Current Weight</span>
                        <span className="text-2xl font-bold">{weightData.currentWeight} kg</span>
                    </div>
                    
                    <div className="bg-violet-500/50 rounded-xl p-4 flex flex-col justify-center">
                        <span className="text-violet-200 text-sm mb-1">Goal Weight</span>
                        <span className="text-2xl font-bold">{weightData.goalWeight} kg</span>
                    </div>
                    
                    <div className="bg-violet-500/50 rounded-xl p-4 flex flex-col justify-center">
                        <span className="text-violet-200 text-sm mb-1">Left to Lose</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{remainingWeight} kg</span>
                            <TrendingDown size={20} className="text-emerald-300" />
                        </div>
                    </div>
                </div>

                {/* Daily Nutrition Targets (NEW) */}
                <div className="bg-violet-800/40 rounded-xl p-4 mb-6 border border-violet-500/30">
                    <h3 className="text-violet-200 text-sm font-semibold mb-3 tracking-wide">TODAY'S NUTRITION</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Calories */}
                        <div>
                            <div className="flex justify-between text-xs text-violet-100 mb-1">
                                <span>Calories</span>
                                <span>{macroData.calories.current} / {macroData.calories.target}</span>
                            </div>
                            <div className="w-full bg-violet-900/60 rounded-full h-2">
                                <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${(macroData.calories.current / macroData.calories.target) * 100}%` }}></div>
                            </div>
                        </div>
                        {/* Protein */}
                        <div>
                            <div className="flex justify-between text-xs text-violet-100 mb-1">
                                <span>Protein</span>
                                <span>{macroData.protein.current}g / {macroData.protein.target}g</span>
                            </div>
                            <div className="w-full bg-violet-900/60 rounded-full h-2">
                                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(macroData.protein.current / macroData.protein.target) * 100}%` }}></div>
                            </div>
                        </div>
                        {/* Carbs */}
                        <div>
                            <div className="flex justify-between text-xs text-violet-100 mb-1">
                                <span>Carbs</span>
                                <span>{macroData.carbs.current}g / {macroData.carbs.target}g</span>
                            </div>
                            <div className="w-full bg-violet-900/60 rounded-full h-2">
                                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(macroData.carbs.current / macroData.carbs.target) * 100}%` }}></div>
                            </div>
                        </div>
                        {/* Fats */}
                        <div>
                            <div className="flex justify-between text-xs text-violet-100 mb-1">
                                <span>Fat</span>
                                <span>{macroData.fat.current}g / {macroData.fat.target}g</span>
                            </div>
                            <div className="w-full bg-violet-900/60 rounded-full h-2">
                                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(macroData.fat.current / macroData.fat.target) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weight Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-2 text-violet-200">
                        <span>{progress}%</span>
                        <span>Weight Goal Progress</span>
                    </div>
                    <div className="w-full bg-violet-800 rounded-full h-3">
                        <div 
                            className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Daily Tip Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex items-start gap-4 shadow-sm">
                <div className="bg-amber-100 p-3 rounded-full text-amber-500 shrink-0">
                    <Lightbulb size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-amber-800 mb-1">Tip of the Day</h3>
                    <p className="text-amber-700">{dailyTip}</p>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div>
                <div className="flex justify-between items-end mb-4 px-1">
                    <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <div 
                                key={index} 
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative group hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`p-3 rounded-xl ${action.bgColor} ${action.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-800 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{action.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{action.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-end border-t pt-6 mt-8 mb-8">
                <button 
                    onClick={handleLogout} 
                    className="px-6 py-2 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                >
                    Logout
                </button>
            </div>
            
        </div>
    );
};

export default Home;