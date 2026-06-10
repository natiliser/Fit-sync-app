import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Clock, Flame, Calendar, PlusCircle, Activity, FileText, ArrowLeft } from 'lucide-react';

const Workouts = () => {

     const navigate = useNavigate();

    // 1. ניהול הסטייט (State)
    const [workoutsLog, setWorkoutsLog] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [formData, setFormData] = useState({
        workoutType: 'Strength', // ערך דיפולטיבי
        duration: '',
        caloriesBurned: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // 2. משיכת היסטוריית האימונים כשהדף נטען
    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/workouts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkoutsLog(res.data.workouts);
        } catch (error) {
            console.error("Error fetching workouts:", error);
        }
    };

    // 3. טיפול בשינויים בשדות הקלט
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 4. שליחת הטופס לשרת (כולל ולידציות לפי SUC-4)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ולידציה: חובה להזין זמן אימון תקין
        if (!formData.duration || formData.duration < 1) {
            setMessage({ text: 'Please enter a valid workout duration (minutes)', type: 'error' });
            return;
        }

        // בניית האובייקט לשליחה (מנקים שדות ריקים)
        const payload = { ...formData };
        if (payload.caloriesBurned === '') delete payload.caloriesBurned; // כדי שהשרת יחשב לבד
        if (payload.notes === '') delete payload.notes;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/workouts', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // עדכון הרשימה המקומית עם האימון החדש (כולל הקלוריות שחושבו בשרת!)
            setWorkoutsLog([response.data.workout, ...workoutsLog]);
            
            // איפוס הטופס
            setFormData({
                workoutType: 'Strength',
                duration: '',
                caloriesBurned: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setIsAdding(false);
            setMessage({ text: 'Workout saved successfully!', type: 'success' });
            
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);

        } catch (error) {
            console.error("Error saving workout:", error);
            setMessage({ text: error.response?.data?.msg || 'Failed to save workout', type: 'error' });
        }
    };

    // פונקציית עזר להצגת אייקון לפי סוג האימון
    const getWorkoutIcon = (type) => {
        switch(type) {
            case 'Running': return <Activity className="text-blue-500" />;
            case 'Yoga': return <Activity className="text-teal-500" />;
            case 'Walking': return <Activity className="text-green-500" />;
            case 'Strength': return <Dumbbell className="text-orange-500" />;
            default: return <Activity className="text-purple-500" />;
        }
    };

    return (
        
        <div className="max-w-4xl mx-auto mt-10 p-4 font-sans">
            
            <div className="flex justify-between items-center mb-8">
                
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Dumbbell className="text-violet-600" size={32} />
                        Workouts Diary
                    </h1>
                    
                    <p className="text-gray-500 mt-1">Track your training and calories burned</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-violet-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} />
                    {isAdding ? 'Cancel' : 'Log Workout'}
                </button>
            </div>

            {/* הודעות שגיאה / הצלחה */}
            {message.text && (
                <div className={`p-4 rounded-xl mb-6 font-semibold ${
                    message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* טופס הוספת אימון */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Log a New Session</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* סוג אימון */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Workout Type</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 text-gray-400" size={20} />
                                <select 
                                    name="workoutType"
                                    value={formData.workoutType}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                                >
                                    <option value="Strength">Strength Training</option>
                                    <option value="Running">Running</option>
                                    <option value="Walking">Walking</option>
                                    <option value="Yoga">Yoga</option>
                                    <option value="Mixed">Mixed / Other</option>
                                </select>
                            </div>
                        </div>

                        {/* תאריך */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* זמן (חובה) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Minutes) *</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="number"
                                    name="duration"
                                    placeholder="e.g. 45"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* קלוריות ידני (אופציונלי) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calories Burned (Optional)</label>
                            <div className="relative">
                                <Flame className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="number"
                                    name="caloriesBurned"
                                    placeholder="Leave empty for auto-calc"
                                    value={formData.caloriesBurned}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* הערות (אופציונלי) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input 
                                    type="text"
                                    name="notes"
                                    placeholder="e.g. Chest and Triceps, felt strong today"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-2">
                            <button 
                                type="submit"
                                className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-md"
                            >
                                Save Workout
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* היסטוריית אימונים */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Recent Workouts</h2>
                
                {workoutsLog.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-10 text-center">
                        <Dumbbell className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 font-medium">No workouts logged yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Click 'Log Workout' to record your first session!</p>
                    </div>
                ) : (
                    workoutsLog.map((workout) => (
                        <div key={workout._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                            
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    {getWorkoutIcon(workout.workoutType)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{workout.workoutType}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(workout.date).toLocaleDateString('he-IL')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 md:gap-8">
                                <div className="text-center">
                                    <span className="block text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Duration</span>
                                    <span className="font-bold text-gray-800 flex items-center justify-center gap-1">
                                        <Clock size={16} className="text-violet-500"/>
                                        {workout.duration} min
                                    </span>
                                </div>
                                
                                <div className="text-center">
                                    <span className="block text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Burned</span>
                                    <span className="font-bold text-gray-800 flex items-center justify-center gap-1">
                                        <Flame size={16} className="text-orange-500"/>
                                        {workout.caloriesBurned} kcal
                                    </span>
                                </div>
                            </div>
                            
                            {workout.notes && (
                                <div className="w-full md:w-auto bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border border-gray-100 flex-grow md:max-w-xs">
                                    <span className="font-semibold text-gray-700">Notes: </span>{workout.notes}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Workouts;