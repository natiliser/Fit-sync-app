import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, Search, X, Flame , ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recipes = () => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRecipe, setSelectedRecipe] = useState(null);  // Manage the modal state


    const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Vegan'];

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await axios.get('http://localhost:5000/recipes');
                setRecipes(res.data.recipes);
            } catch (error) {
                console.error("Error fetching recipes:", error);
            }
        };
        fetchRecipes();
    }, []);

    // Filter recipes based on the selected category
    const filteredRecipes = selectedCategory === 'All' 
        ? recipes 
        : recipes.filter(r => r.category === selectedCategory);

    return (
        <div className="max-w-6xl mx-auto mt-10 p-4 font-sans">
            <div className="mb-8 text-center">
                
                <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-3">
                    <ChefHat className="text-violet-600" size={40} />
                    Healthy Recipes
                </h1>
                <p className="text-gray-500 text-lg">Discover nutritious meals to fuel your fitness journey</p>
            </div>

            {/* Category filter bar*/}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${
                            selectedCategory === category 
                            ? 'bg-violet-600 text-white shadow-md' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Recipe grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.map((recipe) => (
                    <div 
                        key={recipe._id} 
                        onClick={() => setSelectedRecipe(recipe)} // Open the modal
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                    >
                        <div className="h-56 overflow-hidden relative">
                            {recipe.image ? (
                                <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-violet-50 flex items-center justify-center text-violet-200">
                                    <ChefHat size={64} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-orange-500 flex items-center gap-1 shadow-sm">
                                <Flame size={16} /> {recipe.calories} kcal
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2 block">{recipe.category}</span>
                            <h3 className="font-bold text-gray-800 text-xl mb-3">{recipe.name}</h3>
                            
                            <div className="flex gap-4 text-sm text-gray-600 font-medium">
                                <div>Protein: <span className="text-gray-900">{recipe.protein}g</span></div>
                                <div>Carbs: <span className="text-gray-900">{recipe.carbs}g</span></div>
                                <div>Fat: <span className="text-gray-900">{recipe.fat}g</span></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for displaying full recipe details */}
            {selectedRecipe && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95">
                        
                        <button 
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        {selectedRecipe.image && (
                            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-72 object-cover rounded-t-3xl" />
                        )}

                        <div className="p-8">
                            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                                {selectedRecipe.category}
                            </span>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{selectedRecipe.name}</h2>
                            
                            <div className="grid grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                <div><p className="text-xs text-gray-500 mb-1">Calories</p><p className="font-bold text-lg text-orange-500">{selectedRecipe.calories}</p></div>
                                <div><p className="text-xs text-gray-500 mb-1">Protein</p><p className="font-bold text-lg text-blue-500">{selectedRecipe.protein}g</p></div>
                                <div><p className="text-xs text-gray-500 mb-1">Carbs</p><p className="font-bold text-lg text-green-500">{selectedRecipe.carbs}g</p></div>
                                <div><p className="text-xs text-gray-500 mb-1">Fat</p><p className="font-bold text-lg text-yellow-500">{selectedRecipe.fat}g</p></div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Search size={20} className="text-violet-500" /> Ingredients
                                </h3>
                                <ul className="space-y-2 mb-8">
                                    {selectedRecipe.ingredients.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                                            <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recipes;