import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';

const AdminRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({ 
        name: '', category: 'Breakfast', ingredients: '', 
        calories: '', protein: '', carbs: '', fat: '', image: '' 
    });
    
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/recipes');
            setRecipes(res.data.recipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // וולידציה מחמירה
        const calories = parseFloat(formData.calories);
        if (!formData.name.trim() || isNaN(calories) || calories < 0 || calories > 2000) {
            setErrors({ general: "Invalid Name or Calories (Max 2000)" });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/recipes', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg(res.data.msg);
            setRecipes([res.data.recipe, ...recipes]);
            
            setFormData({ 
                name: '', category: 'Breakfast', ingredients: '', 
                calories: '', protein: '', carbs: '', fat: '', image: '' 
            });
            setIsAdding(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Error adding recipe:", error);
            setErrors({ general: error.response?.data?.msg || "Error saving recipe" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(recipes.filter(recipe => recipe._id !== id));
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Error deleting recipe.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-4 font-sans" dir="ltr">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <ChefHat className="text-violet-600" size={32} /> Admin Panel - Recipes
                    </h1>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-violet-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} /> {isAdding ? 'Cancel' : 'Add New Recipe'}
                </button>
            </div>

            {successMsg && <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 font-semibold border border-emerald-200">{successMsg}</div>}
            {errors.general && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-semibold border border-red-200">{errors.general}</div>}

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100 mb-8 animate-in fade-in">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Recipe Details</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500">
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                            </select>
                        </div>

                        {/* שדות עם וולידציה: מינימום 0, מקסימום 100 למאקרו, step="any" למספרים עשרוניים */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calories</label>
                            <input type="number" name="calories" value={formData.calories} onChange={handleChange} min="0" max="2000" step="any" required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {['protein', 'carbs', 'fat'].map(f => (
                                <div key={f}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">{f} (g)</label>
                                    <input type="number" name={f} value={formData[f]} onChange={handleChange} min="0" max="100" step="any" required
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500" />
                                </div>
                            ))}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients</label>
                            <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} rows="2" required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500" />
                        </div>

                        <button type="submit" className="md:col-span-2 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700">Publish Recipe</button>
                    </form>
                </div>
            )}

            {/* רשימת המתכונים */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    // ה-RELATIVE כאן הוא זה שפותר את בעיית המיקום של הפח אשפה
                    <div key={recipe._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
                        {recipe.image ? (
                            <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
                        ) : (
                            <div className="w-full h-48 bg-violet-50 flex items-center justify-center text-violet-200">
                                <ChefHat size={64} />
                            </div>
                        )}
                        
                        <div className="p-5">
                            <h3 className="font-bold text-gray-800 text-xl mb-1">{recipe.name}</h3>
                            <p className="text-orange-500 font-semibold mb-3">{recipe.calories} kcal</p>
                            <p className="text-gray-500 text-sm line-clamp-2">{recipe.ingredients}</p>
                        </div>

                        {/* הפח אשפה צמוד לפינה הימנית העליונה של הדיב הזה */}
                        <button 
                            onClick={() => handleDelete(recipe._id)} 
                            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminRecipes;