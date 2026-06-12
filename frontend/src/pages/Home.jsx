import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Target, Lightbulb, LucideTrendingUpDown, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const navigate = useNavigate();


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

    const [userHeight, setUserHeight] = useState(175);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // 1. Fetch user profile
                const userResponse = await axios.get('http://localhost:5000/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = userResponse.data.user || userResponse.data;

                if (user.height) {
                    setUserHeight(user.height);
                }

                // 2. Fetch today's consumed meals summary
                const mealsResponse = await axios.get('http://localhost:5000/meals/today', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const consumedToday = mealsResponse.data;

                // 3. Fetch measurements history to get the absolute latest logged weight
                const measurementsResponse = await axios.get('http://localhost:5000/measurements', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const measurements = measurementsResponse.data.measurements || [];
                let latestWeight = user.startWeight || 0;

                if (measurements.length > 0) {

                    const sorted = [...measurements].sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    latestWeight = sorted[0].weight;
                }

                // 4. Update weight state
                setWeightData({
                    currentWeight: latestWeight,
                    goalWeight: user.goalWeight || 0,
                    startWeight: user.startWeight || 0
                });

                // 5. Update nutrition state
                setMacroData({
                    calories: {
                        current: consumedToday.calories || 0,
                        target: user.dailyTargets?.calories || 0
                    },
                    protein: {
                        current: consumedToday.protein || 0,
                        target: user.dailyTargets?.protein || 0
                    },
                    carbs: {
                        current: consumedToday.carbs || 0,
                        target: user.dailyTargets?.carbs || 0
                    },
                    fat: {
                        current: consumedToday.fat || 0,
                        target: user.dailyTargets?.fat || 0
                    }
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
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
    "Eat whole foods whenever possible; they keep you full longer and provide better nutrients.",
    "Master your form before adding weight; ego lifting is the fastest way to get sidelined by injury.",
    "Stretching after a workout can help improve your range of motion and reduce muscle stiffness.",
    "Don't fear fats! Healthy fats like avocados and nuts are essential for hormone production.",
    "Focus on the mind-muscle connection; squeeze the muscle you are working rather than just moving the weight.",
    "Listen to your body. If you feel sharp pain, stop immediately—discomfort is okay, but pain is not.",
    "Pre-workout nutrition matters; a small meal with carbs and protein 1-2 hours before training boosts performance.",
    "Vary your training. Introducing new exercises helps prevent plateaus and keeps you motivated.",
    "Your post-workout meal isn't urgent, but getting enough total daily protein is.",
    "Be patient. Fitness is a lifelong journey, not a sprint. Enjoy the process of getting stronger."
];

    const [dailyTip, setDailyTip] = useState("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * fitnessTips.length);
        setDailyTip(fitnessTips[randomIndex]);
    }, []);

    const calculateWeightProgress = () => {
        if (!weightData.startWeight || !weightData.goalWeight || weightData.startWeight === weightData.goalWeight) {
            return 0;
        }
        const totalToLose = weightData.startWeight - weightData.goalWeight;
        const lostSoFar = weightData.startWeight - weightData.currentWeight;
        return Math.min(Math.max((lostSoFar / totalToLose) * 100, 0), 100).toFixed(0);
    };

    const progress = calculateWeightProgress();
    const remainingWeight = Math.abs(weightData.currentWeight - weightData.goalWeight).toFixed(2);

    // Remaining nutrition logic
    const remainingCalories = Math.max(macroData.calories.target - macroData.calories.current, 0);
    const remainingProtein = Math.max(macroData.protein.target - macroData.protein.current, 0);


    const heightCm = userHeight;
    const heightM = heightCm / 100;
    const bmiValue = (weightData.currentWeight > 0 && heightM > 0)
        ? weightData.currentWeight / (heightM * heightM)
        : 0;
    const bmi = bmiValue > 0 ? bmiValue.toFixed(1) : 0;

    // Map BMI range (15 to 35) to gauge degrees (0 to 180)
    const getBmiNeedleRotation = () => {
        const minBmi = 15;
        const maxBmi = 35;
        const percentage = Math.min(Math.max((bmi - minBmi) / (maxBmi - minBmi), 0), 1);
        return percentage * 180;
    };

    const getBmiCategory = () => {
        if (bmi < 18.5) return { text: "Underweight", color: "text-yellow-400" };
        if (bmi < 25) return { text: "Normal Weight", color: "text-emerald-400" };
        if (bmi < 30) return { text: "Overweight", color: "text-orange-400" };
        return { text: "Obese", color: "text-red-400" };
    };

    // Circular progress ring helper function
    const getCircleOffset = (current, target) => {
        const radius = 24;
        const circumference = 2 * Math.PI * radius;
        const pct = Math.min(current / (target || 1), 1);
        return circumference - pct * circumference;
    };

    const checkIsAdmin = () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const decoded = jwtDecode(token);
            return decoded.role === 'admin';
        } catch (error) {
            return false;
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-4 font-sans" dir="ltr">

            {/* Main Expanded Purple Card Container */}
            <div className="bg-violet-600 rounded-3xl p-8 text-white shadow-xl flex flex-col gap-8 min-h-[600px] text-left">

                {/* Header & Admin Panel Button */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Target className="text-red-400" size={32} strokeWidth={2.5} />
                        <h1 className="text-4xl font-bold tracking-tight">Welcome to FitSync!</h1>
                    </div>

                    {checkIsAdmin() && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-slate-950/40 border border-violet-400/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md self-start md:self-auto"
                        >
                            <Settings size={18} className="text-violet-300" />
                            Admin Panel
                        </button>
                    )}
                </div>

                <p className="text-violet-200 text-lg -mt-4">
                    Track your weight, nutrition, and workouts all in one place.
                </p>

                {/* Weight Data Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-violet-500/40 border border-violet-400/20 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
                        <span className="text-violet-200 text-sm font-medium mb-1">Current Weight</span>
                        <span className="text-3xl font-bold">{weightData.currentWeight} kg</span>
                    </div>

                    <div className="bg-violet-500/40 border border-violet-400/20 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
                        <span className="text-violet-200 text-sm font-medium mb-1">Goal Weight</span>
                        <span className="text-3xl font-bold">{weightData.goalWeight} kg</span>
                    </div>

                    <div className="bg-violet-500/40 border border-violet-400/20 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
                        <span className="text-violet-200 text-sm font-medium mb-1">Left for Goal Weight</span>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold">{remainingWeight} kg</span>
                            <LucideTrendingUpDown size={22} className="text-emerald-300" />
                        </div>
                    </div>
                </div>

                {/* Grid Split: Left 2/3 Nutrition Rings, Right 1/3 BMI Gauge */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Nutrition rings display wrapper */}
                    <div className="lg:col-span-2 bg-violet-950/30 rounded-2xl p-6 border border-violet-500/20 shadow-inner flex flex-col justify-between">
                        <div>
                            <h3 className="text-violet-200 text-xs font-bold mb-6 tracking-widest uppercase">Today's Nutrition</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                                {/* Calories Ring */}
                                <div className="bg-violet-900/40 border border-violet-400/10 p-4 rounded-xl flex flex-col items-center text-center">
                                    <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="36"
                                                className="stroke-violet-800/80"
                                                strokeWidth="6"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="36"
                                                className="stroke-orange-400 transition-all duration-500"
                                                strokeWidth="6"
                                                fill="transparent"
                                                strokeDasharray={2 * Math.PI * 36}
                                                strokeDashoffset={2 * Math.PI * 36 - (Math.min((macroData.calories.current / (macroData.calories.target || 1)), 1) * (2 * Math.PI * 36))}
                                                strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-xs font-bold text-orange-300">
                                            {Math.min(((macroData.calories.current / (macroData.calories.target || 1)) * 100), 100).toFixed(0)}
                                            %
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold block text-violet-200">Calories</span>
                                    <span className="text-xs text-white mt-1 font-mono">{macroData.calories.current}/{macroData.calories.target}</span>
                                </div>

                                {/* Protein Ring */}
                                <div className="bg-violet-900/40 border border-violet-400/10 p-4 rounded-xl flex flex-col items-center text-center">
                                    <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle 
                                            cx="48" 
                                            cy="48" 
                                            r="36" 
                                            className="stroke-violet-800/80" 
                                            strokeWidth="6" fill="transparent"
                                            />
                                            <circle 
                                            cx="48" 
                                            cy="48" 
                                            r="36" 
                                            className="stroke-blue-400 transition-all duration-500" 
                                            strokeWidth="6" fill="transparent" strokeDasharray={2 * Math.PI * 36} 
                                            strokeDashoffset={2 * Math.PI * 36 - (Math.min((macroData.protein.current / (macroData.protein.target || 1)), 1) * (2 * Math.PI * 36))} 
                                            strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-xs font-bold text-blue-300">{Math.min(((macroData.protein.current / (macroData.protein.target || 1)) * 100), 100).toFixed(0)}%</span>
                                    </div>
                                    <span className="text-sm font-semibold block text-violet-200">Protein</span>
                                    <span className="text-xs text-white mt-1 font-mono">{macroData.protein.current}g/{macroData.protein.target}g</span>
                                </div>

                                {/* Carbs Ring */}
                                <div className="bg-violet-900/40 border border-violet-400/10 p-4 rounded-xl flex flex-col items-center text-center">
                                    <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle 
                                            cx="48" 
                                            cy="48" 
                                            r="36" 
                                            className="stroke-violet-800/80" 
                                            strokeWidth="6" 
                                            fill="transparent"
                                             />
                                            <circle 
                                            cx="48" 
                                            cy="48" 
                                            r="36" 
                                            className="stroke-green-400 transition-all duration-500" 
                                            strokeWidth="6" fill="transparent" 
                                            strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 - (Math.min((macroData.carbs.current / (macroData.carbs.target || 1)), 1) * (2 * Math.PI * 36))} 
                                            strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-xs font-bold text-green-300">{Math.min(((macroData.carbs.current / (macroData.carbs.target || 1)) * 100), 100).toFixed(0)}%</span>
                                    </div>
                                    <span className="text-sm font-semibold block text-violet-200">Carbs</span>
                                    <span className="text-xs text-white mt-1 font-mono">{macroData.carbs.current}g/{macroData.carbs.target}g</span>
                                </div>

                                {/* Fat Ring */}
                                <div className="bg-violet-900/40 border border-violet-400/10 p-4 rounded-xl flex flex-col items-center text-center">
                                    <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle 
                                            cx="48" 
                                            cy="48" 
                                            r="36" 
                                            className="stroke-violet-800/80" 
                                            strokeWidth="6" 
                                            fill="transparent"
                                             />
                                            <circle 
                                            cx="48" 
                                            cy="48" 
                                            r="36" 
                                            className="stroke-yellow-400 transition-all duration-500" 
                                            strokeWidth="6" 
                                            fill="transparent" 
                                            strokeDasharray={2 * Math.PI * 36} 
                                            strokeDashoffset={2 * Math.PI * 36 - (Math.min((macroData.fat.current / (macroData.fat.target || 1)), 1) * (2 * Math.PI * 36))} 
                                            strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-xs font-bold text-yellow-300">{Math.min(((macroData.fat.current / (macroData.fat.target || 1)) * 100), 100).toFixed(0)}%</span>
                                    </div>
                                    <span className="text-sm font-semibold block text-violet-200">Fat</span>
                                    <span className="text-xs text-white mt-1 font-mono">{macroData.fat.current}g/{macroData.fat.target}g</span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* BMI Visual Gauge Card */}
                    <div className="bg-violet-950/30 rounded-2xl p-6 border border-violet-500/20 shadow-inner flex flex-col items-center justify-center text-center">
                        <h3 className="text-violet-200 text-xs font-bold mb-2 tracking-widest uppercase self-start">Dynamic BMI Index</h3>

                        {/* Semi-circle SVG Gauge Meter */}
                        <div className="relative w-48 h-24 mt-4 overflow-hidden">
                            <svg className="w-full h-full" viewBox="0 0 100 50">
                                {/* Base track background color */}
                                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#4c1d95" strokeWidth="10" strokeLinecap="round" />

                                {/* Yellow Arc - Underweight */}
                                <path d="M 10 50 A 40 40 0 0 1 35 22" fill="none" stroke="#facc15" strokeWidth="10" />

                                {/* Green Arc - Normal */}
                                <path d="M 35 22 A 40 40 0 0 1 65 22" fill="none" stroke="#34d399" strokeWidth="10" />

                                {/* Red Arc - Overweight & Obese */}
                                <path d="M 65 22 A 40 40 0 0 1 90 50" fill="none" stroke="#f87171" strokeWidth="10" strokeLinecap="round" />

                                {/* Meter Needle Pin - rotates based on formula input dynamically */}
                                <g transform={`rotate(${getBmiNeedleRotation()}, 50, 50)`}>
                                    <line x1="50" y1="50" x2="15" y2="50" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                                    <circle cx="50" cy="50" r="4" fill="#ffffff" />
                                </g>
                            </svg>
                        </div>

                        {/* Text and category outputs */}
                        <div className="mt-3">
                            <span className="text-4xl font-extrabold block font-mono">{bmi}</span>
                            <span className={`text-sm font-bold block mt-1 ${getBmiCategory().color}`}>
                                {getBmiCategory().text}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Cumulative Weight Goal Progress Bar */}
                <div className="bg-violet-500/20 p-4 rounded-xl border border-violet-400/10">
                    <div className="flex justify-between text-sm mb-2 text-violet-200 font-medium">
                        <span>Weight Goal Progress: {progress}%</span>
                        <span>Weight Goal Progress</span>
                    </div>
                    <div className="w-full bg-violet-950/50 rounded-full h-3 shadow-inner">
                        <div
                            className="bg-white h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Smart Remaining Summary Text calculated locally on client */}
                <div className="border-t border-violet-400/30 pt-4 text-center md:text-left">
                    <p className="text-lg font-light text-violet-100">
                        You have <span className="font-bold text-orange-300">{remainingCalories}</span> calories and <span className="font-bold text-blue-300">{remainingProtein}g</span> of protein left to hit your daily goal!
                    </p>
                </div>

                {/* Clean Embedded Tip of the Day Box */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-start gap-4 mt-auto">
                    <div className="bg-white/10 p-2.5 rounded-xl text-amber-300 shrink-0">
                        <Lightbulb size={22} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-0.5">Tip of the Day</h4>
                        <p className="text-violet-100 text-sm leading-relaxed">{dailyTip}</p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Home;