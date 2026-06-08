import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';

const AdminRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    
    // סטייט תואם בדיוק למודל המעודכן בשרת
    const [formData, setFormData] = useState({ 
        name: '', 
        category: 'Breakfast', 
        ingredients: '', 
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        image: '' 
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
        
        // ולידציה מקומית
        let validationErrors = {};
        if (!formData.name) validationErrors.name = "חובה למלא שם";
        if (!formData.calories) validationErrors.calories = "חובה למלא קלוריות";
        if (!formData.ingredients) validationErrors.ingredients = "חובה למלא רכיבים";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/recipes', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg(res.data.msg);
            setRecipes([res.data.recipe, ...recipes]);
            
            // איפוס הטופס
            setFormData({ 
                name: '', category: 'Breakfast', ingredients: '', 
                calories: '', protein: '', carbs: '', fat: '', image: '' 
            });
            setIsAdding(false);

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Error adding recipe:", error);
            setErrors({ general: error.response?.data?.msg || "שגיאה בשמירת המתכון" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק מתכון זה?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRecipes(recipes.filter(recipe => recipe._id !== id));
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("שגיאה במחיקת המתכון. ודא שיש לך הרשאות מנהל.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-4 font-sans" dir="ltr">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <ChefHat className="text-violet-600" size={32} />
                        Admin Panel - Recipes
                    </h1>
                    <p className="text-gray-500 mt-1">Add or remove recipes from the database</p>
                </div>
                
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-violet-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} />
                    {isAdding ? 'Cancel' : 'Add New Recipe'}
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

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Recipe Details</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Vegan">Vegan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calories</label>
                            <input type="number" name="calories" value={formData.calories} onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            {errors.calories && <p className="text-red-500 text-xs mt-1">{errors.calories}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
                                <input type="number" name="protein" value={formData.protein} onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Carbs (g)</label>
                                <input type="number" name="carbs" value={formData.carbs} onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fat (g)</label>
                                <input type="number" name="fat" value={formData.fat} onChange={handleChange}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients (comma separated)</label>
                            <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} rows="2"
                                placeholder="Eggs, Milk, Flour..."
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                            {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input type="text" name="image" value={formData.image} onChange={handleChange}
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    placeholder="https://example.com/image.jpg" />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-2">
                            <button type="submit" className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-md">
                                Publish Recipe
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
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
                            <p className="text-gray-500 text-sm line-clamp-2">
                                {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}
                            </p>
                        </div>

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(recipe._id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 shadow-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminRecipes;