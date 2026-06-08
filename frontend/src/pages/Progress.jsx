import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Activity, Filter, AlertCircle , ArrowLeft  } from 'lucide-react';

const Progress = () => {
    const navigate = useNavigate();

    // 1. סטייטים לסינון (Filters) לפי SUC-9
    const [timeRange, setTimeRange] = useState('month'); // 'week' | 'month' | 'all'
    const [dataType, setDataType] = useState('weight'); // 'weight' | 'workouts'
    
    // 2. סטייטים לנתונים
    const [rawWeightData, setRawWeightData] = useState([]);
    const [rawWorkoutData, setRawWorkoutData] = useState([]);
    const [chartData, setChartData] = useState([]);
    
    // סטייט שמנהל את ההסתעפות של "אין מספיק נתונים"
    const [hasEnoughData, setHasEnoughData] = useState(true);

    // משיכת כל הנתונים מהשרת בטעינה הראשונית
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // משיכת מידות (לגרף משקל)
                const weightRes = await axios.get('http://localhost:5000/measurements', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // משיכת אימונים (לגרף קלוריות שנשרפו)
                const workoutsRes = await axios.get('http://localhost:5000/workouts', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setRawWeightData(weightRes.data.measurements);
                setRawWorkoutData(workoutsRes.data.workouts);
            } catch (error) {
                console.error("Error fetching data for charts:", error);
            }
        };

        fetchAllData();
    }, []);

    // לוגיקת הסינון - רצה מחדש כל פעם שהמשתמש משנה את סוג הגרף או את טווח הזמן
    useEffect(() => {
        processData(dataType, timeRange);
    }, [dataType, timeRange, rawWeightData, rawWorkoutData]);

    const processData = (type, range) => {
        // בחירת מקור הנתונים הנכון
        let sourceData = type === 'weight' ? [...rawWeightData] : [...rawWorkoutData];
        
        if (sourceData.length === 0) {
            setHasEnoughData(false);
            return;
        }

        // חישוב תאריך החיתוך (Cutoff Date)
        const cutoffDate = new Date();
        if (range === 'week') {
            cutoffDate.setDate(cutoffDate.getDate() - 7);
        } else if (range === 'month') {
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        } else {
            cutoffDate.setFullYear(2000); // כל הזמנים
        }

        // סינון הנתונים לפי התאריך
        const filtered = sourceData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });

        // בדיקת הסתעפות (SUC-9): האם יש מספיק נתונים להציג מגמה? (לפחות 2 נקודות לגרף קו, או 1 לבר)
        const requiredPoints = type === 'weight' ? 2 : 1;
        if (filtered.length < requiredPoints) {
            setHasEnoughData(false);
            setChartData([]);
            return;
        }

        setHasEnoughData(true);

        // עיבוד הנתונים לפורמט ש-Recharts אוהב והפיכת הסדר (מהישן לחדש)
        const formatted = filtered.map(item => ({
            date: new Date(item.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
            value: type === 'weight' ? item.weight : item.caloriesBurned
        })).reverse();

        setChartData(formatted);
    };

    // עיצוב החלונית שקופצת במעבר עכבר
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
        <div className="max-w-5xl mx-auto mt-10 p-4 font-sans">
            <div className="mb-8">
                <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-800 transition-colors">
                    <ArrowLeft size={20} /> Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <TrendingDown className="text-violet-600" size={32} />
                    Stats & Progress
                </h1>
                <p className="text-gray-500 mt-1">Analyze your data and track your journey</p>
            </div>

            {/* SUC-9: תפריט סינון (שאילתות) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold w-full sm:w-auto">
                    <Filter size={20} className="text-violet-500" />
                    Filters:
                </div>
                
                {/* סינון סוג נתונים */}
                <select 
                    value={dataType} 
                    onChange={(e) => setDataType(e.target.value)}
                    className="w-full sm:w-auto p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none bg-gray-50"
                >
                    <option value="weight">Weight Trend</option>
                    <option value="workouts">Calories Burned (Workouts)</option>
                </select>

                {/* סינון טווח זמן */}
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

            {/* אזור תצוגת הגרף או השגיאה */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 h-96">
                
                {/* הסתעפות SUC-9: הודעת חוסר נתונים */}
                {!hasEnoughData ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <AlertCircle size={48} className="text-amber-400 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">אין מספיק נתונים להצגת הגרף בטווח שנבחר.</h3>
                        <p className="text-sm">יש למלא את כל הנתונים וכל המידות של המשתמש כדי לראות סטטיסטיקות.</p>
                    </div>
                ) : (
                    /* הצגת הגרף אם יש נתונים */
                    <ResponsiveContainer width="100%" height="100%">
                        {dataType === 'weight' ? (
                            // גרף קו/שטח למשקל
                            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        ) : (
                            // גרף עמודות לקלוריות מאימונים
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