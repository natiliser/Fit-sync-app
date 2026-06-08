import { useState, useEffect } from 'react';
import axios from 'axios';
import { Apple, PlusCircle, Trash2, Search } from 'lucide-react';

const AdminFoodItems = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // סטייט תואם למודל (FoodItem)
    const [formData, setFormData] = useState({ 
        name: '', 
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    });
    
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');

    // משיכת פריטי המזון בטעינת הקומפוננטה
    useEffect(() => {
        fetchFoodItems();
    }, []);

    const fetchFoodItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/food-items'); // ודא שזה הנתיב הנכון בשרת שלך
            // מיון אלפביתי כדי שיהיה נוח לאדמין למצוא דברים
            const sortedItems = res.data.foodItems.sort((a, b) => a.name.localeCompare(b.name));
            setFoodItems(sortedItems);
        } catch (error) {
            console.error("Error fetching food items:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // ניקוי הודעת השגיאה כשהמשתמש מתחיל להקליד
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ולידציה מקומית לפני השליחה (SUC-8 - כל השדות נדרשים)
        let validationErrors = {};
        if (!formData.name.trim()) validationErrors.name = "חובה להזין שם פריט";
        if (!formData.calories) validationErrors.calories = "חובה להזין קלוריות";
        if (!formData.protein) validationErrors.protein = "חובה להזין חלבון";
        if (!formData.carbs) validationErrors.carbs = "חובה להזין פחמימות";
        if (!formData.fat) validationErrors.fat = "חובה להזין שומן";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/food-items', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg("הפריט מזון נוסף בהצלחה");
            setFoodItems([...foodItems, res.data.foodItem].sort((a, b) => a.name.localeCompare(b.name)));
            
            // איפוס הטופס אחרי שמירה מוצלחת
            setFormData({ 
                name: '', calories: '', protein: '', carbs: '', fat: '' 
            });
            setIsAdding(false);

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Error adding food item:", error);
            
            // הסתעפות SUC-8: זיהוי פריט כפול 
            // בהנחה שהשרת שלך מחזיר קוד 400 או 409 ויש במודל 'unique: true'
            if (error.response?.data?.msg?.includes('duplicate') || error.response?.status === 400 || error.response?.status === 409) {
                 setErrors({ general: "פריט בשם זה כבר קיים במאגר." });
            } else {
                 setErrors({ general: error.response?.data?.msg || "שגיאה ביצירת פריט מזון" });
            }
        }
    };

    // מחיקת פריט מזון
    const handleDelete = async (id) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק פריט זה מהמאגר המרכזי? פעולה זו עלולה להשפיע על יומני ארוחות של משתמשים.")) return;

        try {
            const token = localStorage.getItem('token');
            // ודא שיש לך פונקציית מחק (DELETE) מוגדרת בראוטר של ה-Food Items
            await axios.delete(`http://localhost:5000/food-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFoodItems(foodItems.filter(item => item._id !== id));
        } catch (error) {
            console.error("Error deleting food item:", error);
            alert("שגיאה במחיקת הפריט.");
        }
    };

    // סינון הרשימה לפי החיפוש
    const filteredItems = foodItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="font-sans" dir="ltr">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Food Items Database</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage single ingredients used by users in their meals diaries.</p>
                </div>
                
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                >
                    <PlusCircle size={20} />
                    {isAdding ? 'Cancel' : 'Add Food Item'}
                </button>
            </div>

            {successMsg && (
                <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 font-semibold border border-emerald-200">
                    {successMsg}
                </div>
            )}
            
            {errors.general && (
                <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold border border-red-200">
                    {errors.general}
                </div>
            )}

            {/* טופס הוספת מזון */}
            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                        
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Food Name</label>
                            <input 
                                type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Chicken Breast"
                                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                            />
                            {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Calories (100g)</label>
                            <input 
                                type="number" name="calories" value={formData.calories} onChange={handleChange} placeholder="kcal"
                                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.calories ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Protein (g)</label>
                            <input 
                                type="number" name="protein" value={formData.protein} onChange={handleChange} placeholder="0g"
                                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.protein ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Carbs (g)</label>
                            <input 
                                type="number" name="carbs" value={formData.carbs} onChange={handleChange} placeholder="0g"
                                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.carbs ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fat (g)</label>
                            <input 
                                type="number" name="fat" value={formData.fat} onChange={handleChange} placeholder="0g"
                                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.fat ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                            />
                        </div>

                        <div className="md:col-span-4 flex justify-end items-end h-full mt-2">
                            <button type="submit" className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md w-full sm:w-auto">
                                Save Item
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* שורת חיפוש (חשוב כשיש מאגר גדול של מזון) */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search food items..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                />
            </div>

            {/* רשימת המזון במאגר (תצוגת טבלה פשוטה ונקייה) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold text-center">Calories</th>
                                <th className="p-4 font-semibold text-center">Protein</th>
                                <th className="p-4 font-semibold text-center">Carbs</th>
                                <th className="p-4 font-semibold text-center">Fat</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        No food items found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            {item.name}
                                        </td>
                                        <td className="p-4 text-center font-semibold text-orange-500">{item.calories}</td>
                                        <td className="p-4 text-center text-gray-600">{item.protein}g</td>
                                        <td className="p-4 text-center text-gray-600">{item.carbs}g</td>
                                        <td className="p-4 text-center text-gray-600">{item.fat}g</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFoodItems;