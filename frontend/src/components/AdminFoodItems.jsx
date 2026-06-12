import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Search } from 'lucide-react';

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
        
        // וולידציה מקיפה בשרת (כדי להיות בטוחים)
        const calories = parseFloat(formData.calories);
        const protein = parseFloat(formData.protein);
        const carbs = parseFloat(formData.carbs);
        const fat = parseFloat(formData.fat);

        if (!formData.name.trim() || calories < 0 || calories > 900 || protein < 0 || protein > 100 || carbs < 0 || carbs > 100 || fat < 0 || fat > 100) {
            setErrors({ general: "Please check your inputs (Values must be within realistic ranges for 100g)" });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/food-items', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg("Added successfully");
            setFoodItems([...foodItems, res.data.foodItem].sort((a, b) => a.name.localeCompare(b.name)));
            setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
            setIsAdding(false);
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
        <div className="font-sans" dir="ltr">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Food Items Database</h2>
                    <p className="text-gray-500 text-sm">Manage global ingredients per 100g.</p>
                </div>
                <button onClick={() => setIsAdding(!isAdding)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <PlusCircle size={20} /> {isAdding ? 'Cancel' : 'Add Food Item'}
                </button>
            </div>

            {/* Success/Error Alerts */}
            {successMsg && <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl mb-6">{successMsg}</div>}
            {errors.general && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{errors.general}</div>}

            {/* Input Form */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-8">
                    <div className="mb-4 p-3 bg-violet-100/50 text-violet-700 border border-violet-200 rounded-lg text-xs flex gap-2">
                        <span>💡</span>
                        <p><strong>Note:</strong> Nutritional values must be entered <strong>per 100g</strong>.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Food Name" required className="md:col-span-2 p-2.5 border rounded-lg" />
                        
                        {['calories', 'protein', 'carbs', 'fat'].map(field => {
                            const max = field === 'calories' ? 900 : 100;
                            return (
                                <input 
                                    key={field}
                                    type="number"
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    placeholder={field}
                                    min="0"
                                    max={max}
                                    step="any"
                                    required
                                    className="p-2.5 border rounded-lg"
                                    onInvalid={(e) => e.target.setCustomValidity(`Max value for ${field} is ${max}`)}
                                    onInput={(e) => e.target.setCustomValidity('')}
                                />
                            );
                        })}
                        <button type="submit" className="bg-green-600 text-white py-2.5 rounded-lg font-bold">Save</button>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 uppercase text-xs text-gray-500">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4 text-center">Calories</th>
                            <th className="p-4 text-center">Protein</th>
                            <th className="p-4 text-center">Carbs</th>
                            <th className="p-4 text-center">Fat</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredItems.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="p-4 font-semibold">{item.name}</td>
                                <td className="p-4 text-center text-orange-500">{item.calories}</td>
                                <td className="p-4 text-center">{item.protein}g</td>
                                <td className="p-4 text-center">{item.carbs}g</td>
                                <td className="p-4 text-center">{item.fat}g</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
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