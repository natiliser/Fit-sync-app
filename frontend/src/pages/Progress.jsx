import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Activity, Filter, AlertCircle, Percent, Ruler, ArrowLeft, Info } from 'lucide-react';

const Progress = () => {
    const navigate = useNavigate();

    const [timeRange, setTimeRange] = useState('month');
    const [dataType, setDataType] = useState('weight');

    const [rawWeightData, setRawWeightData] = useState([]);
    const [rawWorkoutData, setRawWorkoutData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [hasEnoughData, setHasEnoughData] = useState(true);

    // הוספנו דגל (isEstimated) שיעזור לנו לדעת איזה באנר להציג
    const [userData, setUserData] = useState(null);
    const [currentStats, setCurrentStats] = useState({ bmi: null, bodyFat: null, latestWeight: null, isEstimated: false });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');

                const weightRes = await axios.get('http://localhost:5000/measurements', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const workoutsRes = await axios.get('http://localhost:5000/workouts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userRes = await axios.get('http://localhost:5000/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const measurements = weightRes.data.measurements;

                // תיקון קריטי: שליפה בטוחה של המשתמש גם אם הוא עטוף וגם אם הוא ישיר
                const user = userRes.data.user || userRes.data;

                setRawWeightData(measurements);
                setRawWorkoutData(workoutsRes.data.workouts);
                setUserData(user);

                if (measurements.length > 0 && user?.height) {
                    const latestMeasurement = measurements[0]; // המדידה האחרונה
                    calculateStats(latestMeasurement, user);
                }

            } catch (error) {
                console.error("Error fetching data for charts:", error);
            }
        };

        fetchAllData();
    }, []);

    const calculateStats = (measurement, user) => {
        const weight = measurement?.weight;
        const heightCm = user?.height;

        //for debug
        console.log("נתוני קלט שהגיעו לחישוב:", {
            weight,
            heightCm,
            waist: measurement?.waist,
            neck: measurement?.neck,
            hip: measurement?.hip
        });

        if (!weight || !heightCm) return;

        const heightM = heightCm / 100;

        // 1. חישוב BMI (משקל חלקי גובה במטרים בריבוע)
        const bmiValue = weight / (heightM * heightM);

        // 2. חישוב אחוז שומן (נוסחת US Navy המטרית - עבודה ישירה בס"מ)
        let bodyFatValue = null;
        let estimated = false;

        const waist = measurement?.waist;
        const neck = measurement?.neck;
        const hip = measurement?.hip;

        // 1. החישוב הרגיל של ה-US Navy
        if (waist && neck && waist > neck) {
            if (user.gender === 'male') {
                bodyFatValue = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450;
            } 
            else if (user.gender === 'female' && hip) {
                bodyFatValue = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(heightCm)) - 450;
            }
        }

        // 2. בדיקת הגיוניות התוצאה הסופית
        // אם התוצאה שחזרה מהנוסחה היא מחוץ לטווח הגיוני (למשל קטנה מ-3% או גדולה מ-60%) - נפסול אותה!
        if (bodyFatValue !== null && (bodyFatValue < 3 || bodyFatValue > 60 || isNaN(bodyFatValue))) {
            bodyFatValue = null; // מאפסים אותה כדי שהשלב הבא יפעיל את הגיבוי
        }

        // 3. מנגנון הגיבוי (יופעל עכשיו אוטומטית גם עבור ערכים הזויים שהקלידו בטעות)
        if (!bodyFatValue && user?.age && user?.gender) {
            estimated = true;
            const sexFactor = user.gender === 'male' ? 1 : 0;
            bodyFatValue = (1.20 * bmiValue) + (0.23 * user.age) - (10.8 * sexFactor) - 5.4;
        }

        // קביעת הערך הסופי לתצוגה
        const finalBodyFat = (bodyFatValue && !isNaN(bodyFatValue) && bodyFatValue > 0)
            ? bodyFatValue.toFixed(1)
            : 'N/A';

        setCurrentStats({
            latestWeight: weight,
            bmi: bmiValue.toFixed(1),
            bodyFat: finalBodyFat,
            isEstimated: estimated
        });
    };

    useEffect(() => {
        processData(dataType, timeRange);
    }, [dataType, timeRange, rawWeightData, rawWorkoutData]);

    const processData = (type, range) => {
        let sourceData = type === 'weight' ? [...rawWeightData] : [...rawWorkoutData];

        if (sourceData.length === 0) {
            setHasEnoughData(false);
            return;
        }

        const cutoffDate = new Date();
        if (range === 'week') cutoffDate.setDate(cutoffDate.getDate() - 7);
        else if (range === 'month') cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        else cutoffDate.setFullYear(2000);

        const filtered = sourceData.filter(item => new Date(item.date) >= cutoffDate);

        const requiredPoints = type === 'weight' ? 2 : 1;
        if (filtered.length < requiredPoints) {
            setHasEnoughData(false);
            setChartData([]);
            return;
        }

        setHasEnoughData(true);

        const formatted = filtered.map(item => ({
            date: new Date(item.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
            value: type === 'weight' ? item.weight : item.caloriesBurned
        })).reverse();

        setChartData(formatted);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">{label}</p>
                    <p className={`font-bold text-lg ${dataType === 'weight' ? 'text-violet-600' : 'text-orange-500'}`}>
                        {payload[0].value} {dataType === 'weight' ? 'kg' : 'kcal'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-4 font-sans" dir="ltr">
            <div className="mb-8 text-left">
                
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <TrendingDown className="text-violet-600" size={32} />
                    Stats & Progress
                </h1>
                <p className="text-gray-500 mt-1">Analyze your data and track your journey</p>
            </div>

            {/* כרטיסיות הסטטיסטיקה */}
            {currentStats.latestWeight && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                            <Ruler size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Current BMI</p>
                            <p className="text-2xl font-bold text-gray-800">{currentStats.bmi}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-pink-50 text-pink-600 rounded-xl relative">
                            <Percent size={24} />
                            {/* כוכבית קטנה ליד האייקון אם זה מוערך */}
                            {currentStats.isEstimated && (
                                <span className="absolute -top-1 -right-1 text-pink-400 font-bold">*</span>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
                                Body Fat {currentStats.isEstimated && "(Est.)"}
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {currentStats.bodyFat}{currentStats.bodyFat !== 'N/A' ? '%' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Latest Weight</p>
                            <p className="text-2xl font-bold text-gray-800">{currentStats.latestWeight} kg</p>
                        </div>
                    </div>
                </div>
            )}

            {/* הודעה חיובית המציעה להוסיף היקפים במקום שגיאה */}
            {currentStats.isEstimated && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-8 flex items-center gap-3 text-blue-700 text-sm font-semibold" dir="rtl">
                    <Info size={20} className="text-blue-500 shrink-0" />
                    <p>אחוז השומן כרגע הוא הערכה כללית המבוססת על גיל ו-BMI. לחישוב מדויק יותר, מומלץ להזין היקפי מותן וצוואר ביומן המדידות.</p>
                </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold w-full sm:w-auto">
                    <Filter size={20} className="text-violet-500" />
                    Filters:
                </div>

                <select
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value)}
                    className="w-full sm:w-auto p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50"
                >
                    <option value="weight">Weight Trend</option>
                    <option value="workouts">Calories Burned (Workouts)</option>
                </select>

                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full sm:w-auto p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50"
                >
                    <option value="week">Last 7 Days (Week)</option>
                    <option value="month">Last 30 Days (Month)</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 h-96">
                {!hasEnoughData ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200" dir="rtl">
                        <AlertCircle size={48} className="text-amber-400 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">אין מספיק נתונים להצגת הגרף בטווח שנבחר.</h3>
                        <p className="text-sm text-gray-400">יש למלא לפחות שתי שקילות כדי לראות מגמת שינוי במשקל.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {dataType === 'weight' ? (
                            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default Progress;