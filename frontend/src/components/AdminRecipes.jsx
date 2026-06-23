import { useState, useEffect } from 'react';
import { ChefHat, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../api';

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
            const res = await api.get('/recipes');
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

        // Convert data to numbers
        const cals = parseFloat(formData.calories) || 0;
        const prot = parseFloat(formData.protein) || 0;
        const carb = parseFloat(formData.carbs) || 0;
        const fat = parseFloat(formData.fat) || 0;

        // Name is required
        if (!formData.name.trim()) {
            setErrors({ general: "Recipe name is required." });
            return;
        }

        // Block illogical values (less than 5 kcal is not considered a valid food item)
        if (cals < 5) {
            setErrors({ general: "Calories must be at least 5." });
            return;
        }

        // Mathematical sanity check
        const calculatedCals = (prot * 4) + (carb * 4) + (fat * 9);
        const diff = Math.abs(cals - calculatedCals);

        // Block if the absolute difference is greater than 7 
        // OR if the relative deviation exceeds 25%
        const isRelativelyOff = calculatedCals > 0 && (diff / calculatedCals) > 0.25;
        const isAbsolutelyOff = diff > 7;

        if (cals > 0 && (isRelativelyOff || isAbsolutelyOff)) {
            setErrors({ general: `Math error: You entered ${cals} kcal, but the macros equate to ~${Math.round(calculatedCals)} kcal.` });
            return;
        }

        // Block "1 in all fields" scenario 
        if ((prot + carb + fat) < 1) {
            setErrors({ general: "Please specify at least 1g of macros." });
            return;
        }

        // Send to server
        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/recipes', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg("Recipe published successfully!");
            setRecipes([res.data.recipe, ...recipes]);

            setFormData({
                name: '', category: 'Breakfast', ingredients: '',
                calories: '', protein: '', carbs: '', fat: '', image: ''
            });
            setIsAdding(false);
            setErrors({});
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("Error adding recipe:", error);
            setErrors({ general: error.response?.data?.msg || "Error saving recipe" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recipe?")) return;

        try {
            const token = localStorage.getItem('token');
            await api.delete(`/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRecipes(recipes.filter(recipe => recipe._id !== id));
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("Error deleting recipe. Check console for details.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-4 font-sans" dir="ltr">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <ChefHat className="text-violet-600" size={32} /> Admin Panel - Recipes
                    </h1>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-violet-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-sm"
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
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none">
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calories</label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleChange}
                                min="1"
                                max="2000"
                                step="any"
                                required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['protein', 'carbs', 'fat'].map(f => (
                                <div key={f}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">{f} (g)</label>
                                    <input
                                        type="number"
                                        name={f}
                                        value={formData[f]}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="any"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients</label>
                            <textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                rows="2"
                                required
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                        </div>

                        {/* Image */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                            </div>
                        </div>

                        <button type="submit" className="md:col-span-2 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors">Publish Recipe</button>
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
                            <p className="text-gray-500 text-sm line-clamp-2">{recipe.ingredients}</p>
                        </div>
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