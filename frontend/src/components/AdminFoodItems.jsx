import { useState, useEffect } from 'react';
import axios from 'axios';
import { Apple, PlusCircle, Trash2, Search } from 'lucide-react';

const AdminFoodItems = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => { fetchFoodItems(); }, []);

    const fetchFoodItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/food-items');
            const sortedItems = res.data.foodItems.sort((a, b) => a.name.localeCompare(b.name));
            setFoodItems(sortedItems);
        } catch (error) { console.error("Error fetching food items:", error); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cals = parseFloat(formData.calories) || 0;
        const prot = parseFloat(formData.protein) || 0;
        const carb = parseFloat(formData.carbs) || 0;
        const fat = parseFloat(formData.fat) || 0;

        // 1. חסימת ערכים לא הגיוניים בכלל
        if (cals < 5) {
            setErrors({ general: "Calories must be at least 5 per 100g." });
            return;
        }

        // 2. חישוב קלוריות לפי מאקרוז (4, 4, 9)
        const calculatedCals = (prot * 4) + (carb * 4) + (fat * 9);

        // ה-LOGIC החדש והמחמיר:
        // אנחנו בודקים אם יש סטייה גדולה מדי. 
        // הוספתי בדיקה משולבת: 
        // א. ההפרש חייב להיות קטן מ-10 קלוריות (בשביל סטייה של עיגול מספרים)
        // ב. או שההפרש קטן מ-20% מהערך הכולל (בשביל מוצרים גדולים יותר)
        const diff = Math.abs(cals - calculatedCals);

        // כאן נחסום את זה בצורה חכמה יותר:
        // אם הקלוריות שוות ל-0, זה לא רלוונטי (הקוד כבר טיפל בזה).
        // אם יש הפרש גדול מ-8 קלוריות (אבסולוטי)
        // וגם - הסטייה היא מעל 25% מהערך המחושב (אחוזים)
        const isRelativelyOff = calculatedCals > 0 && (diff / calculatedCals) > 0.25;
        const isAbsolutelyOff = diff > 8;

        if (cals > 0 && (isRelativelyOff || isAbsolutelyOff)) {
            setErrors({ general: `Math error: You entered ${cals} kcal, but the macros equate to ~${Math.round(calculatedCals)} kcal.` });
            return;
        }

        if (cals > 0 && diff > 10 && diff > (cals * 0.2)) {
            setErrors({ general: `Math error: You entered ${cals} kcal, but the macros equate to ~${Math.round(calculatedCals)} kcal.` });
            return;
        }

        // 3. חסימת "1 בכל השדות" (אם הכל 1, הקלוריות יהיו 17, והסטייה תהיה גדולה מדי)
        if (cals > 0 && (prot + carb + fat) < 1) {
            setErrors({ general: "Please specify at least 1g of macros." });
            return;
        }

        // שליחה לשרת...
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/food-items', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg("Food item added successfully!");
            setFoodItems([...foodItems, res.data.foodItem].sort((a, b) => a.name.localeCompare(b.name)));
            setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
            setIsAdding(false);
            setErrors({});

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            setErrors({ general: error.response?.data?.msg || "Error creating food item" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/food-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFoodItems(foodItems.filter(item => item._id !== id));
        } catch (error) { alert("Error deleting item."); }
    };

    const filteredItems = foodItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="max-w-4xl mx-auto mt-10 p-4 font-sans" dir="ltr">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Apple className="text-green-600" size={24} /> Food Database
                    </h2>
                    <p className="mt-1">Manage global ingredients per 100g.</p>
                </div>
                <button onClick={() => setIsAdding(!isAdding)} className="bg-violet-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-sm">
                    <PlusCircle size={20} /> {isAdding ? 'Cancel' : 'Add Food Item'}
                </button>
            </div>

            {/* Alerts */}
            {successMsg && <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 font-semibold">{successMsg}</div>}
            {errors.general && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold">{errors.general}</div>}

            {/* Input Form - New Design */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Add New Item</h2>
                    <div className="mb-6 p-3 bg-violet-100/50 text-violet-700 border border-violet-200 rounded-lg text-xs flex gap-2">
                        <span>💡</span>
                        <p><strong>Note:</strong> Nutritional values must be entered <strong>per 100g</strong>.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
                        </div>

                        {['calories', 'protein', 'carbs', 'fat'].map(field => {
                            const max = field === 'calories' ? 900 : 100;
                            return (
                                <div key={field}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">{field}</label>
                                    <input
                                        type="number" name={field} value={formData[field]} onChange={handleChange}
                                        placeholder={field} min="1" max={max} step="any" required
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                            );
                        })}

                        <button type="submit" className="md:col-span-2 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-md">
                            Save Item
                        </button>
                    </form>
                </div>
            )}

            {/* Search Bar (Unchanged) */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search food items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* Table (Unchanged) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                        <tr>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold text-center">Calories</th>
                            <th className="p-4 font-semibold text-center">Protein</th>
                            <th className="p-4 font-semibold text-center">Carbs</th>
                            <th className="p-4 font-semibold text-center">Fat</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredItems.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 group">
                                <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                                <td className="p-4 text-center text-orange-500 font-medium">{item.calories}</td>
                                <td className="p-4 text-center">{item.protein}g</td>
                                <td className="p-4 text-center">{item.carbs}g</td>
                                <td className="p-4 text-center">{item.fat}g</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFoodItems;