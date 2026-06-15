import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Calendar, Ruler, TrendingDown, Save, Activity } from 'lucide-react';

const Measurements = () => {
    const navigate = useNavigate();

    const [measurementsLog, setMeasurementsLog] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        weight: '',
        waist: '',
        neck: '',
        hip: '',
        date: new Date().toISOString().split('T')[0]
    });


    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login')
                    return;
                }

                const res = await axios.get('http://localhost:5000/measurements', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.data && res.data.measurements) {

                    const sorted = res.data.measurements.sort((a, b) => {
                        const dateA = new Date(a.date).getTime();
                        const dateB = new Date(b.date).getTime();

                        if (dateA !== dateB)
                            return dateB - dateA;

                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });
                    setMeasurementsLog(sorted);
                }
            }
            catch (error) {
                console.error("Error fetching measurements:", error);
            }
        }
        fetchMeasurements();
    }, [navigate]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: '', type: '' });
    };

    const handleSaveMeasurement = async (e) => {
        e.preventDefault();

        // Measurements validations
        const weightVal = parseFloat(formData.weight);
        if (!formData.weight || weightVal < 30) {
            setMessage({ text: 'Weight must be at least 30kg', type: 'error' });
            return;
        }
        if (formData.waist !== '' && parseFloat(formData.waist) < 50) {
            setMessage({ text: 'Waist measurement must be at least 50cm', type: 'error' });
            return;
        }
        if (formData.neck !== '' && parseFloat(formData.neck) < 30) {
            setMessage({ text: 'Neck measurement must be at least 30cm', type: 'error' });
            return;
        }
        if (formData.hip !== '' && parseFloat(formData.hip) < 60) {
            setMessage({ text: 'Hip measurement must be at least 60cm', type: 'error' });
            return;
        }

        // Create a clean object for submission (remove empty fields to avoid database validation errors)
        const payload = { ...formData };
        if (payload.waist === '') delete payload.waist;
        if (payload.neck === '') delete payload.neck;
        if (payload.hip === '') delete payload.hip;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/measurements', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedList = [response.data.measurement, ...measurementsLog];
            updatedList.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                if (dateA !== dateB) 
                    return dateB - dateA;
                
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setMeasurementsLog(updatedList);

            setFormData({
                weight: '',
                waist: '',
                neck: '',
                hip: '',
                date: new Date().toISOString().split('T')[0]
            });
            setIsAdding(false);
            setMessage({ text: 'Measurement saved successfully!', type: 'success' });

            setTimeout(() => setMessage({ text: '', type: '' }), 3000);

        } catch (error) {
            console.error("Error saving measurement:", error);
            setMessage({ text: error.response?.data?.msg || 'Failed to save measurement', type: 'error' });
        }
    };


    const formatDate = (dateString) => {
        const options = { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('he-IL', options); // can change to 'en-US' instead
    };


    return (
        <div className="max-w-4xl mx-auto mt-10 p-4 font-sans">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">

                <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-violet-700 transition-colors">
                    {isAdding ? 'Cancel' : <><Plus size={20} /> Log Measurement</>}
                </button>
            </div>

            {/* Notification Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg font-semibold text-center border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {message.text}
                </div>
            )}

            {/* Add Measurement Form */}
            {isAdding && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="h-2 bg-violet-500 w-full"></div>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <Ruler className="text-violet-500" size={24} /> New Measurement
                        </h2>

                        <form onSubmit={handleSaveMeasurement}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Required: Date & Weight */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-1">Weight (kg) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            name="weight"
                                            placeholder="e.g. 72.5"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Optional: Circumferences */}
                                <div className="space-y-4 bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                                    <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">Optional - For Body Fat %</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Waist at navel (cm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="waist"
                                                value={formData.waist}
                                                onChange={handleChange}
                                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg"
                                                placeholder="e.g. 85"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Neck Below the Adam's apple (cm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="neck"
                                                value={formData.neck}
                                                onChange={handleChange}
                                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg"
                                                placeholder="e.g. 38"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Hip (cm)</label>
                                            <h5 className="block text-xs font-semibold text-gray-600 mb-1">* women only</h5>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="hip"
                                                value={formData.hip}
                                                onChange={handleChange}
                                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg"
                                                placeholder="e.g. 95"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors shadow-md">
                                    <Save size={20} /> Save Progress
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Log */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingDown className="text-violet-500" size={24} /> Progress History
                </h2>

                {measurementsLog.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-3">
                        <Activity size={40} className="text-gray-300" />
                        <p>No measurements logged yet. Start tracking your progress today!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {measurementsLog.map((log) => (
                            <div key={log._id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        {log.weight} kg
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar size={14} /> {formatDate(log.date || log.createdAt)}
                                    </p>
                                </div>

                                {(log.waist || log.neck || log.hip) && (
                                    <div className="flex gap-4 text-sm bg-white px-4 py-2 rounded-lg border border-gray-200">
                                        {log.waist && <div><span className="text-gray-400 text-xs block">Waist</span> <span className="font-semibold">{log.waist}cm</span></div>}
                                        {log.neck && <div><span className="text-gray-400 text-xs block">Neck</span> <span className="font-semibold">{log.neck}cm</span></div>}
                                        {log.hip && <div><span className="text-gray-400 text-xs block">Hip</span> <span className="font-semibold">{log.hip}cm</span></div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Measurements